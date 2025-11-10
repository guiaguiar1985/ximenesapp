/// <reference types="vite/client" />
import React, { useEffect, useMemo, useRef, useState, createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
// @ts-ignore – pdfmake ships without typed exports for the build bundles
import pdfMake from "pdfmake/build/pdfmake";
// @ts-ignore – pdfmake ships without typed exports for the build bundles
import pdfFonts from "pdfmake/build/vfs_fonts";
import { LOGO_XIMENES_NET } from "./assets/pdfHeaderLogo";

function SmokeTests(){
  useEffect(() => {
    const comparaveis: Comparavel[] = [{ metragem: 50, preco: 300000 }];
    const precosM2 = comparaveis.map((item) => {
      const metragem = Math.max(1, toNumber(item.metragem));
      return toNumber(item.preco) / metragem;
    });
    if (precosM2[0] !== 6000) console.error("Smoke test failed: pm2 basic calc");
    const confianca = calcConfianca(precosM2);
    if (confianca < 0.15 || confianca > 1) console.error("Smoke test failed: confidence range");
    const ajusteOk = atualizarPorDataSecovi(426000, "2015-01-01");
    if (!(ajusteOk.ok && Math.round(ajusteOk.atualizado) === 604000)) console.error("Smoke test failed: datas ecovi interpolation");
    const ajusteFalha = atualizarPorDataSecovi(100000, "2005-01-01");
    if (ajusteFalha.ok) console.error("Smoke test failed: datas ecovi range");
    const endereco = buildEnderecoCompleto({ logradouro: "Rua A", numero: "10", complemento: "Sala 301", bairro: "Centro", cidade: "BH", uf: "MG" });
    if (!endereco.includes("Rua A 10")) console.error("Smoke test failed: endereco format");
    if (Math.abs(toNumber("1.234,56") - 1234.56) >= 1e-6) console.error("Smoke test failed: toNumber parsing");
    if (!fmtBRL(1234.56).startsWith("R$")) console.error("Smoke test failed: fmtBRL prefix");
  }, []);
  return null;
}


// ==================================================
// Ximenes Netimóveis – App de Avaliação (React/TSX)
// Sistema completo com perfis, histórico e gerenciamento
// ==================================================

// ===================== Tipos =====================
type UserRole = 'user' | 'master' | 'admin';
interface Usuario { id: string; name: string; email: string; role: UserRole }
interface Endereco { logradouro: string; numero?: string | number; complemento?: string; bairro?: string; cidade?: string; uf?: string }
interface DataSecovi { unidade?: string; dataUltimaVenda?: string; valorUltimaVenda?: number }
interface DadosImovel extends Endereco { cep?: string; finalidade: 'residencial' | 'comercial'; tipoAvaliacao: 'venda' | 'locacao'; quartos?: number | string; metragem: number | string; dataSecovi?: DataSecovi }
interface Comparavel { link?: string; bairro?: string; metragem: number | string; preco: number | string; quartos?: number | string }
interface Avaliacao { id: string; userId: string; userName: string; createdAt: number; updatedAt: number; dados: DadosImovel; comps: Comparavel[]; resultado: { valorCentral: number; valorPiso: number; valorTeto: number; precoM2: number; confianca: number } }
interface AuthState { user: Usuario | null; login?: (email:string,pwd:string)=>void; register?: (email:string,pwd:string,name:string)=>void; logout?: ()=>void; updateName?: (name:string)=>void }

// ===================== Contexto Auth =====================
const AuthCtx = createContext<AuthState>({ user: null });

function getUserRole(email: string): UserRole {
  const lower = email.toLowerCase().trim();
  if (lower === 'guilherme@ximenes.com.br') return 'admin';
  const masters = [
    'cassia@ximenes.com.br',
    'flaviamatamachado@ximenes.com.br',
    'victoria@ximenes.com.br'
  ];
  if (masters.includes(lower)) return 'master';
  return 'user';
}

function useAuth(){
  const [user,setUser] = useState<Usuario | null>(()=>{ try{ return JSON.parse(localStorage.getItem('xim-auth-session')||'null'); }catch{return null;} });
  function loadUsers(){ try{ return JSON.parse(localStorage.getItem('xim-auth-users')||'{}'); }catch{return {} as Record<string, any>;} }
  function saveUsers(u:Record<string, any>){ localStorage.setItem('xim-auth-users', JSON.stringify(u)); }
  const hash = (s:string)=> btoa(unescape(encodeURIComponent(s)));
  
  const login = (email:string, pwd:string)=>{
    const users=loadUsers(); const k=email.toLowerCase().trim(); const rec=users[k];
    if(!rec) throw new Error('Usuário não encontrado');
    if(rec.hash!==hash(pwd)) throw new Error('Senha incorreta');
    const role = getUserRole(k);
    const sess: Usuario = { id: k, name: rec.name || k, email:k, role };
    localStorage.setItem('xim-auth-session', JSON.stringify(sess)); setUser(sess);
  };
  
  const register = (email:string, pwd:string, name:string)=>{
    if(!/@ximenes\.com\.br$/i.test(email)) throw new Error('Use um e-mail @ximenes.com.br');
    const users=loadUsers(); const k=email.toLowerCase().trim(); if(users[k]) throw new Error('E-mail já cadastrado');
    const role = getUserRole(k);
    users[k]={ name: name?.trim()||k, hash:hash(pwd), createdAt:Date.now(), role }; saveUsers(users); login(email,pwd);
  };
  
  const updateName = (newName: string)=>{
    if(!user) return;
    const users=loadUsers(); const k=user.email.toLowerCase().trim();
    if(users[k]){
      users[k].name = newName.trim() || k;
      saveUsers(users);
      const updated = { ...user, name: newName.trim() || k };
      localStorage.setItem('xim-auth-session', JSON.stringify(updated));
      setUser(updated);
    }
  };
  
  const logout = ()=>{ localStorage.removeItem('xim-auth-session'); setUser(null); };
  return { user, login, register, logout, updateName } as AuthState;
}

// ===================== Gerenciamento de Avaliações =====================
function loadAvaliacoes(): Avaliacao[] {
  try { return JSON.parse(localStorage.getItem('xim-avaliacoes') || '[]'); } catch { return []; }
}

function saveAvaliacao(avaliacao: Avaliacao) {
  const avaliacoes = loadAvaliacoes();
  const index = avaliacoes.findIndex(a => a.id === avaliacao.id);
  if (index >= 0) {
    avaliacoes[index] = { ...avaliacao, updatedAt: Date.now() };
  } else {
    avaliacoes.push(avaliacao);
  }
  localStorage.setItem('xim-avaliacoes', JSON.stringify(avaliacoes));
}

function deleteAvaliacao(id: string) {
  const avaliacoes = loadAvaliacoes().filter(a => a.id !== id);
  localStorage.setItem('xim-avaliacoes', JSON.stringify(avaliacoes));
}

function getAvaliacoesUsuario(userId: string): Avaliacao[] {
  return loadAvaliacoes().filter(a => a.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

function getAllAvaliacoes(): Avaliacao[] {
  return loadAvaliacoes().sort((a, b) => b.createdAt - a.createdAt);
}

// ===================== Utilidades =====================
const fmtBRL = (v: number): string => new Intl.NumberFormat('pt-BR',{ style:'currency', currency:'BRL'}).format(Number.isFinite(v)? v : 0);
const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const raw = v.trim();
    if(!raw) return 0;
    let cleaned = raw;
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');
    if(hasComma && hasDot){
      cleaned = cleaned.replace(/\./g,'').replace(',', '.');
    }else if(hasComma){
      cleaned = cleaned.replace(',', '.');
    }else{
      // only dot or digits; keep as decimal separator
    }
    cleaned = cleaned.replace(/[^0-9.-]/g,'');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};
const onlyDigits = (s: string)=> s.replace(/\D/g,'');
const maskCEP = (v: string)=>{ const d=onlyDigits(v).slice(0,8); return d.length>5? d.slice(0,5)+'-'+d.slice(5):d; };
const fmtM2 = (v: string|number)=>{
  const num = typeof v === 'number' ? v : toNumber(v);
  return num ? num.toFixed(2).replace('.',',') : '';
};
function formatBRLFromDigits(digits: string){ const clean=digits.replace(/\D/g,''); if(!clean) return { text:"", value:0}; const value=parseInt(clean,10)/100; return { text:fmtBRL(value), value}; }

const createEmptyComparavel = (): Comparavel => ({ link:"", bairro:"", metragem:"", preco:0, quartos:"" });
const ensureComparaveis = (list: Comparavel[] | undefined, min: number = 5): Comparavel[]=>{
  const base = Array.isArray(list) ? list.map(item => ({ ...createEmptyComparavel(), ...item })) : [];
  while(base.length < min){
    base.push(createEmptyComparavel());
  }
  return base;
};

function buildEnderecoCompleto(d: Endereco){
  const numeroFmt = (d.numero ?? '').toString().trim();
  const complementoFmt = (d.complemento ?? '').toString().trim();
  const base = `${d.logradouro || ''} ${numeroFmt}${complementoFmt?`, ${complementoFmt}`:''}`.trim();
  return `${base} – ${d.bairro || '—'} – ${d.cidade || '—'}/${d.uf || '—'}`;
}

function atualizarPorDataSecovi(valorNaData: number, data: string | undefined){
  const ano=(data||'').slice(0,4); const y=Number(ano);
  if(!Number.isFinite(valorNaData)||valorNaData<=0||!Number.isInteger(y)||y<2009||y>2025) return { ok:false as const };
  const f: Record<number,number> = {
    2009: 604000/171000,
    2010: 604000/220000,
    2011: 604000/288000,
    2012: 604000/355000,
    2013: 604000/393000,
    2014: 604000/448000,
    2015: 604000/426000,
    2016: 604000/420000,
    2017: 604000/443000,
    2018: 604000/454000,
    2019: 604000/468000,
    2020: 604000/491000,
    2021: 604000/495000,
    2022: 604000/531000,
    2023: 604000/527000,
    2024: 604000/571000,
    2025: 604000/604000
  };
  const fator = f[y] ?? 1; return { ok:true as const, ano:y, atualizado: valorNaData * fator };
}

function calcConfianca(pm2: number[]): number{
  if(!pm2.length) return 0.15; const media=pm2.reduce((a,b)=>a+b,0)/pm2.length; const sd=Math.sqrt(pm2.reduce((a,v)=>a+(v-media)**2,0)/(pm2.length)); const cv=media>0?sd/media:1; const nTerm=Math.min(1,pm2.length/10); const dispTerm=Math.max(0,1-Math.min(1,cv)); return Math.min(1, Math.max(0.15, 0.5*nTerm+0.5*dispTerm));
}

function filterOutliers(values: number[]): { kept: boolean[]; q1:number; q3:number }{
  if(values.length<4){ return { kept: values.map(()=>true), q1:0, q3:0 }; }
  const sorted = [...values].sort((a,b)=>a-b);
  const q1 = sorted[Math.floor((sorted.length-1)*0.25)];
  const q3 = sorted[Math.floor((sorted.length-1)*0.75)];
  const iqr = q3 - q1; const lo=q1 - 1.5*iqr; const hi=q3 + 1.5*iqr;
  return { kept: values.map(v=> v>=lo && v<=hi), q1, q3 };
}

// ===================== Estilos =====================
function BrandStyles(){
  return (
    <style>{`
      :root{ --brand-primary:#662e8e; --brand-accent:#088ebe; --brand-text:#1c1c1c; --brand-muted:#6b7280; --brand-surface:#fff; --brand-surface-alt:#f7f8fa; --brand-border:#e5e7eb; --form-gap: clamp(16px, 2vw, 24px); }
      .xim-card{ background:var(--brand-surface); color:var(--brand-text); border:1px solid var(--brand-border); border-radius:16px; padding:var(--form-gap); width:100%; box-sizing:border-box; }
      .xim-card label{ display:block; }
      .xim-card-title{ color:var(--brand-primary); font-weight:700; }
      .xim-helper{ color:var(--brand-muted); }
      .xim-input{ border:1px solid var(--brand-border); border-radius:12px; padding:8px 12px; width:100%; font-size:14px; line-height:1.4; }
      .xim-input:focus{ outline:none; border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(102,46,142,.18) }
      .btn{ display:inline-flex; align-items:center; justify-content:center; padding:.6rem 1rem; border-radius:12px; border:1px solid var(--brand-border); font-weight:600; cursor:pointer }
      .btn-primary{ background:var(--brand-primary); color:#fff; border-color:var(--brand-primary) }
      .btn-ghost{ background:#fff; color:var(--brand-primary); border-color:var(--brand-primary) }
      .grid{ display:grid; width:100%; } .gap-3{ gap:12px } .gap-4{ gap:16px }
      .field-grid{ gap:var(--form-gap); margin:0 calc(var(--form-gap) * -0.5); }
      .field-grid > .field-col{ padding:0 calc(var(--form-gap) * 0.5); min-width:0; }
      .md\\:grid-cols-12{ grid-template-columns:repeat(1,minmax(0,1fr)) } @media(min-width:768px){ .md\\:grid-cols-12{ grid-template-columns:repeat(12,minmax(0,1fr)) } }
      .col-span-1, .col-span-2, .col-span-3, .col-span-4, .col-span-6, .col-span-12{ grid-column: 1 / -1; min-width:0; }
      @media(min-width:768px){
        .col-span-1{ grid-column: span 1 / span 1; }
        .col-span-2{ grid-column: span 2 / span 2; }
        .col-span-3{ grid-column: span 3 / span 3; }
        .col-span-4{ grid-column: span 4 / span 4; }
        .col-span-6{ grid-column: span 6 / span 6; }
        .col-span-12{ grid-column: span 12 / span 12; }
        .col-span-1, .col-span-2, .col-span-3, .col-span-4, .col-span-6, .col-span-12{ min-width:0; }
      }
      .xim-input[type="date"]{ font-size:14px; line-height:1.4; font-family:inherit; }
      .mb-1{ margin-bottom:4px } .mb-2{ margin-bottom:8px } .mb-4{ margin-bottom:16px } .mb-6{ margin-bottom:24px }
      .mt-1{ margin-top:4px } .mt-2{ margin-top:8px } .mt-3{ margin-top:12px } .mt-4{ margin-top:16px }
      .my-6{ margin-top:24px; margin-bottom:24px }
      .p-3{ padding:12px } .p-4{ padding:16px } .p-6{ padding:24px }
      .rounded-lg{ border-radius:12px } .rounded-xl{ border-radius:16px }
      .text-sm{ font-size:12px } .text-xs{ font-size:11px } .text-base{ font-size:14px } .text-xl{ font-size:20px } .text-lg{ font-size:18px } .text-3xl{ font-size:28px; font-weight:700 }
      .text-right{ text-align:right } .text-center{ text-align:center }
      .quote-box{ background:var(--brand-surface-alt); border-left:4px solid var(--brand-primary); padding:12px; border-radius:12px }
      .list-disc{ list-style: disc } .pl-5{ padding-left:20px } .space-y-1 > * + *{ margin-top:4px } .space-y-3 > * + *{ margin-top:12px } .space-y-4 > * + *{ margin-top:16px } .space-y-6 > * + *{ margin-top:var(--form-gap); }
      .flex{ display:flex } .flex-1{ flex:1 } .items-start{ align-items:flex-start } .items-center{ align-items:center } .justify-between{ justify-content:space-between } .justify-end{ justify-content:flex-end }
      .underline{ text-decoration: underline } .gap-2{ gap:8px } .gap-3{ gap:12px }
      .min-h-screen{ min-height:100vh } .max-w-md{ max-width:28rem } .max-w-5xl{ max-width:64rem } .mx-auto{ margin-left:auto; margin-right:auto }
      .w-full{ width:100% } .block{ display:block }
    `}</style>
  );
}

function PageLayout({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{background:'#f7f8fa', minHeight:'100vh'}}>
      <BrandStyles />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {header}
        {children}
      </div>
    </div>
  );
}


function XimHeader({ titulo, helper, showLogo = true }: { titulo: string; helper?: string; showLogo?: boolean }){
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        {showLogo && (
          <img src="/logo-horizontal.png" alt="Ximenes" style={{height:32}} onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
        )}
        <h2 className="text-xl xim-card-title">{titulo}</h2>
      </div>
      {!!helper && <p className="text-sm xim-helper mt-1">{helper}</p>}
    </div>
  );
}

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>){ return <button {...props} className="btn btn-primary"/>}
function ButtonGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>){ return <button {...props} className="btn btn-ghost"/>}

function MoneyField({ valueNumber, onValueNumber, placeholder }: { valueNumber: number; onValueNumber: (n:number)=>void; placeholder?:string; }){
  const [text, setText] = useState<string>(valueNumber ? fmtBRL(valueNumber) : "");
  const [focused, setFocused] = useState(false);
  useEffect(()=>{ if(focused) return; setText(valueNumber?fmtBRL(valueNumber):""); },[valueNumber, focused]);
  function handleChange(raw:string){ const clean = raw.replace(/\D/g, ""); const {text,value} = formatBRLFromDigits(clean); setText(text); onValueNumber(value); }
  return (
    <input className="xim-input" value={text} inputMode="numeric" pattern="\\d*" onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={(e)=>handleChange(e.target.value)} placeholder={placeholder||"R$ 0,00"} />
  );
}

let pdfMakeLoader: Promise<any> | null = null;
async function loadPdfMake(){
  if(!pdfMakeLoader){
    pdfMakeLoader = Promise.resolve().then(()=>{
      const instance = (pdfMake as any);
      const fonts = (pdfFonts as any);
      if(fonts?.pdfMake?.vfs){
        instance.vfs = fonts.pdfMake.vfs;
      }else if(fonts?.vfs){
        instance.vfs = fonts.vfs;
      }
      return instance;
    });
  }
  return pdfMakeLoader;
}

// ===================== Scraper Ximenes =====================
type AutofillFetchOrigin = 'direct' | 'proxy';
type AutofillMetricSource = AutofillFetchOrigin | 'cache';
type XimenesScraperResult = { bairro: string; metragem: string; preco: number; quartos: string };

const ximenesAutofillCache = new Map<string, Promise<XimenesScraperResult>>();

async function fetchImovelXimenes(url: string){
  try{
    return await fetchImovelXimenesCached(url);
  }catch(e){
    console.error('Falha scraping:', e);
    return { bairro:"", metragem:"", preco:0, quartos:"" } as const;
  }
}

async function fetchImovelXimenesCached(url: string){
  const cached = ximenesAutofillCache.get(url);
  if(cached){
    const startCache = nowMs();
    try{
      const data = await cached;
      logAutofillMetric(url, nowMs()-startCache, 'cache');
      return data;
    }catch(err){
      ximenesAutofillCache.delete(url);
      throw err;
    }
  }
  const runner = scrapeXimenes(url);
  ximenesAutofillCache.set(url, runner);
  try{
    const data = await runner;
    return data;
  }catch(err){
    ximenesAutofillCache.delete(url);
    throw err;
  }
}

async function scrapeXimenes(url: string){
  const start = nowMs();
  const { html, origin } = await fetchTextParallel(url);
  const parsed = parseXimenesHtml(html);
  logAutofillMetric(url, nowMs()-start, origin);
  return parsed;
}

async function fetchTextParallel(url: string){
  const attempts: Promise<{ html: string; origin: AutofillFetchOrigin }>[] = [
    fetchHtmlWithOrigin(url, 'direct'),
  ];
  const proxyUrl = buildProxyUrl(url);
  if(proxyUrl){
    attempts.push(fetchHtmlWithOrigin(proxyUrl, 'proxy'));
  }
  return promiseAny(attempts);
}

function fetchHtmlWithOrigin(url: string, origin: AutofillFetchOrigin){
  return fetch(url).then(async (response)=>{
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return { html, origin };
  });
}

function buildProxyUrl(rawUrl: string){
  try{
    const parsed = new URL(rawUrl);
    return `https://r.jina.ai/${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
  }catch{
    return null;
  }
}

function promiseAny<T>(promises: Promise<T>[]){
  return new Promise<T>((resolve, reject)=>{
    if(promises.length===0){
      reject(new Error('Nenhuma tentativa disponível'));
      return;
    }
    let rejected = 0;
    const errors: unknown[] = [];
    promises.forEach((promise, idx)=>{
      promise.then(resolve).catch((err)=>{
        errors[idx]=err;
        rejected+=1;
        if(rejected===promises.length){
          reject(errors[0] || err);
        }
      });
    });
  });
}

function parseXimenesHtml(html: string): XimenesScraperResult{
  function pickNumber(s:string){
    const match=(s||"").match(/[0-9.,]+/);
    if(!match) return "";
    const norm=match[0].replace(/\./g,"").replace(",",".");
    const n=parseFloat(norm);
    return Number.isFinite(n)? n.toFixed(2):"";
  }
  const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const lower=text.toLowerCase();
  let bairro="";
  const pos=lower.indexOf('código do imóvel');
  if(pos>0){
    const prev=text.slice(Math.max(0,pos-160),pos).trim();
    const tokens=prev.split(' ').filter(Boolean);
    bairro=tokens.slice(Math.max(0,tokens.length-4)).join(' ').trim();
  }
  if(!bairro){
    const g=text.match(/([A-Za-z\u00C0-\u00FF\s\-']+)\s+Belo\s+Horizonte/i);
    if(g) bairro=(g[1]||"").replace(/\s+/g,' ').trim();
  }
  let metragem="";
  const ia=lower.indexOf('área aproximada');
  if(ia>=0) metragem=pickNumber(text.slice(ia,ia+80));
  if(!metragem){
    const mi=text.indexOf('m²');
    if(mi>0) metragem=pickNumber(text.slice(Math.max(0,mi-18),mi));
  }
  let preco=0;
  const re=/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi;
  let match:any;
  const candidates:any[]=[];
  while((match=re.exec(text))){
    const valor=toNumber(match[0]);
    const ctx=text.slice(Math.max(0,match.index-30), Math.min(text.length,match.index+match[0].length+30)).toLowerCase();
    let score=1;
    if(/(à|a) venda|valor|preço|venda\b/.test(ctx)) score+=3;
    if(/aluguel|locação|\/mês|por mês/.test(ctx)) score-=2;
    if(/condom[ií]nio|iptu|taxa|tarifa/.test(ctx)) score-=5;
    candidates.push({valor,score});
  }
  if(candidates.length){
    candidates.sort((a,b)=> b.score-a.score || b.valor-a.valor);
    preco=candidates[0].valor;
  }
  let quartos="";
  const mq=text.match(/(\d{1,2})\s*(quartos?|dormitórios?)/i);
  if(mq) quartos=String(Number(mq[1]));
  return { bairro, metragem, preco, quartos };
}

function nowMs(){
  if(typeof performance!=='undefined' && typeof performance.now==='function'){
    return performance.now();
  }
  return Date.now();
}

function logAutofillMetric(url: string, durationMs: number, origin: AutofillMetricSource){
  if(!shouldLogAutofillMetric()) return;
  const label = origin==='cache' ? 'cache' : origin==='proxy' ? 'proxy Jina' : 'fetch direto';
  const ms = Math.max(1, Math.round(durationMs));
  console.info(`[Autopreenchimento] ${label} em ${ms}ms — ${url}`);
}

function shouldLogAutofillMetric(){
  return typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;
}

// ===================== Telas =====================
function DadosDoImovel({ dados, setDados, onNext }:{ dados:DadosImovel; setDados:(f:DadosImovel)=>void; onNext:()=>void }){
  const [cepMsg,setCepMsg] = useState(""); const lastCep = useRef("");
  async function fetchCEP(raw:string){ if(!raw||raw.length!==8) return; if(lastCep.current===raw) return; lastCep.current=raw; setCepMsg('Buscando endereço…');
    try{ const r=await fetch(`https://viacep.com.br/ws/${raw}/json/`); const j=await r.json(); if(!j.erro){ setDados({...dados, logradouro:j.logradouro||dados.logradouro, bairro:j.bairro||dados.bairro, cidade:j.localidade||dados.cidade, uf:j.uf||dados.uf}); setCepMsg('Endereço preenchido (ViaCEP)'); return; } }catch{}
    try{ const r2=await fetch(`https://brasilapi.com.br/api/cep/v2/${raw}`); if(!r2.ok) throw new Error(); const b=await r2.json(); setDados({...dados, logradouro:b.street||dados.logradouro, bairro:b.neighborhood||dados.bairro, cidade:b.city||dados.cidade, uf:b.state||dados.uf}); setCepMsg('Endereço preenchido (fallback)'); }catch{ setCepMsg('Não foi possível obter o endereço'); }
  }
  useEffect(()=>{ const raw=onlyDigits(dados.cep||''); if(raw.length===8) fetchCEP(raw); },[dados.cep]);
  const canNext = useMemo(()=>{
    const base = !!(dados.cep && dados.logradouro && dados.numero && dados.bairro && dados.cidade && dados.uf);
    const metr = toNumber(dados.metragem)>0; const qOk = dados.finalidade!=='residencial' || String(dados.quartos||'').length>0; return base && metr && qOk;
  },[dados]);
  const ds = dados.dataSecovi || {};
  return (
      <div className="xim-card">
      <XimHeader titulo="Dados do Imóvel" helper="Preencha as características do alvo" showLogo={false} />
      <div className="grid md:grid-cols-12 field-grid">
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">CEP</label><input className="xim-input" value={dados.cep||''} onChange={(e)=>setDados({...dados, cep:maskCEP(e.target.value)})} placeholder="30130-000" /><div className="mt-1 text-sm xim-helper">{cepMsg}</div></div>
        <div className="field-col col-span-6"><label className="text-sm mb-1 xim-helper">Logradouro</label><input className="xim-input" value={dados.logradouro} onChange={(e)=>setDados({...dados, logradouro:e.target.value})} /></div>
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Número</label><input className="xim-input" value={String(dados.numero||'')} onChange={(e)=>setDados({...dados, numero:e.target.value})} /></div>
        <div className="field-col col-span-4"><label className="text-sm mb-1 xim-helper">Complemento</label><input className="xim-input" value={String(dados.complemento||'')} onChange={(e)=>setDados({...dados, complemento:e.target.value})} placeholder="Apto / Sala" /></div>
        <div className="field-col col-span-4"><label className="text-sm mb-1 xim-helper">Bairro</label><input className="xim-input" value={dados.bairro||''} onChange={(e)=>setDados({...dados, bairro:e.target.value})} /></div>
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Cidade</label><input className="xim-input" value={dados.cidade||''} onChange={(e)=>setDados({...dados, cidade:e.target.value})} /></div>
        <div className="field-col col-span-1"><label className="text-sm mb-1 xim-helper">UF</label><input className="xim-input" value={dados.uf||''} onChange={(e)=>setDados({...dados, uf:e.target.value.toUpperCase().slice(0,2)})} /></div>
      </div>
      <div className="grid md:grid-cols-12 field-grid mt-4">
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Finalidade</label><select className="xim-input" value={dados.finalidade} onChange={(e)=>setDados({...dados, finalidade:e.target.value as DadosImovel['finalidade']})}><option value="residencial">Residencial</option><option value="comercial">Comercial</option></select></div>
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Tipo de avaliação</label><select className="xim-input" value={dados.tipoAvaliacao} onChange={(e)=>setDados({...dados, tipoAvaliacao:e.target.value as DadosImovel['tipoAvaliacao']})}><option value="venda">Venda</option><option value="locacao">Locação</option></select></div>
        {dados.finalidade==='residencial' && (<div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Quartos</label><input type="number" min={0} className="xim-input" value={String(dados.quartos||'')} onChange={(e)=>setDados({...dados, quartos:e.target.value})} /></div>)}
        <div className="field-col col-span-3"><label className="text-sm mb-1 xim-helper">Metragem (m²)</label><input className="xim-input" value={String(dados.metragem||'')} onChange={(e)=>setDados({...dados, metragem:e.target.value})} onBlur={(e)=>setDados({...dados, metragem:fmtM2(e.target.value)})} placeholder="0,00" /></div>
      </div>
      <div className="mt-4">
        <h3 className="text-base xim-card-title mb-2">DataSecovi</h3>
        <div className="grid md:grid-cols-12 field-grid">
          <div className="field-col col-span-4">
            <label className="text-sm mb-1 xim-helper">Ultima Unidade Vendida</label>
            <input
              className="xim-input"
              value={String(ds.unidade||'')}
              onChange={(e)=>setDados({...dados, dataSecovi:{...ds, unidade:e.target.value}})}
              placeholder="Ex.: Torre A - 302"
            />
          </div>
          <div className="field-col col-span-4">
            <label className="text-sm mb-1 xim-helper">Data da Venda</label>
            <input
              type="date"
              className="xim-input"
              value={String(ds.dataUltimaVenda||'')}
              onChange={(e)=>setDados({...dados, dataSecovi:{...ds, dataUltimaVenda:e.target.value}})}
            />
          </div>
          <div className="field-col col-span-4">
            <label className="text-sm mb-1 xim-helper">Valor da Venda</label>
            <MoneyField
              valueNumber={toNumber(ds.valorUltimaVenda||0)}
              onValueNumber={(n)=>setDados({...dados, dataSecovi:{...ds, valorUltimaVenda:n}})}
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>
      <div className="mt-4" style={{ display:"flex", justifyContent:"flex-end" }}><ButtonPrimary onClick={onNext} disabled={!canNext}>Avançar</ButtonPrimary></div>
    </div>
  );
}

function ComparavelItem({ c, idx, setComps }:{ c:Comparavel; idx:number; setComps:Dispatch<SetStateAction<Comparavel[]>> }){
  const isXimenes = (url:string)=>/^(https?:\/\/)?(www\.)?ximenes\.com\.br\//i.test(String(url||""));
  async function handleBlurLink(link:string){
    if(!isXimenes(link)) return;
    const d=await fetchImovelXimenes(link);
    setComps(arr=>arr.map((it,i)=> i===idx ? {
      ...it,
      bairro: d.bairro || it.bairro,
      metragem: d.metragem ? fmtM2(d.metragem) : it.metragem,
      preco: d.preco || it.preco,
      quartos: d.quartos || it.quartos
    } : it));
  }
  return (
      <div className="xim-card">
      <div className="grid md:grid-cols-12 field-grid">
        <div className="field-col col-span-6">
          <label className="text-sm mb-1 xim-helper">Link do Imóvel</label>
          <input
            className="xim-input"
            value={c.link||''}
            onChange={(e)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, link:e.target.value}:it))}
            onBlur={(e)=>handleBlurLink(e.target.value)}
            placeholder="https://www.ximenes.com.br/..."
          />
          {!isXimenes(c.link||'') && (c.link||'').length>0 && (
            <div className="mt-1 text-xs xim-helper">Autopreenchimento: apenas domínio ximenes.com.br</div>
          )}
        </div>
        <div className="field-col col-span-2"><label className="text-sm mb-1 xim-helper">Metragem (m²)</label><input className="xim-input" value={String(c.metragem||'')} onChange={(e)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, metragem:e.target.value}:it))} onBlur={(e)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, metragem:fmtM2(e.target.value)}:it))} placeholder="0,00" /></div>
        <div className="field-col col-span-2"><label className="text-sm mb-1 xim-helper">Preço</label><MoneyField valueNumber={toNumber(c.preco||0)} onValueNumber={(val)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, preco:val}:it))} placeholder="R$ 0,00" /></div>
        <div className="field-col col-span-2"><label className="text-sm mb-1 xim-helper">Quartos</label><input type="number" min={0} className="xim-input" value={String(c.quartos||'')} onChange={(e)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, quartos:e.target.value}:it))} placeholder="0" /></div>
        <div className="field-col col-span-4"><label className="text-sm mb-1 xim-helper">Bairro</label><input className="xim-input" value={String(c.bairro||'')} onChange={(e)=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, bairro:e.target.value}:it))} /></div>
      </div>
      <div className="mt-3 flex items-center gap-3"><ButtonPrimary onClick={()=>handleBlurLink(c.link||'')} disabled={!isXimenes(c.link||'')}>Preencher automaticamente</ButtonPrimary><ButtonGhost onClick={()=>setComps(arr=>arr.map((it,i)=> i===idx?{...it, bairro:"", metragem:"", preco:0, quartos:""}:it))}>Limpar</ButtonGhost></div>
    </div>
  );
}

function TelaComparativo({ comps, setComps, onBack, onNext }:{ comps:Comparavel[]; setComps:Dispatch<SetStateAction<Comparavel[]>>; onBack:()=>void; onNext:()=>void }){
  const canNext = useMemo(()=> comps.filter((c)=> toNumber(c.metragem)>0 && toNumber(c.preco)>0).length>=5 ,[comps]);
  return (
    <div className="space-y-4">
      <h2 className="text-lg xim-card-title">Comparativo</h2>
      <p className="text-sm xim-helper">Inclua de 5 a 10 imóveis comparativos válidos</p>
      {comps.map((c, idx)=>(<ComparavelItem key={idx} c={c} idx={idx} setComps={(next)=>setComps(next)} />))}
      <div className="flex items-center justify-between">
        <ButtonGhost onClick={()=>setComps(prev=> prev.length>5 ? prev.slice(0,-1) : prev)} disabled={comps.length<=5}>Remover último</ButtonGhost>
        <ButtonPrimary onClick={()=>setComps(prev=> [...prev, createEmptyComparavel()])} disabled={comps.length>=10}>+ Adicionar comparativo</ButtonPrimary>
      </div>
      <div className="flex items-center justify-between mt-4"><ButtonGhost onClick={onBack}>Voltar</ButtonGhost><ButtonPrimary onClick={onNext} disabled={!canNext}>Calcular e avançar</ButtonPrimary></div>
    </div>
  );
}

function TelaPerfil({ onClose }: { onClose: ()=>void }){
  const { user, updateName } = React.useContext(AuthCtx);
  const [newName, setNewName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  function handleSave(){
    if(updateName && newName.trim()){
      updateName(newName.trim());
      setSaved(true);
      setTimeout(()=> setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="xim-card">
        <XimHeader titulo="Meu Perfil" helper="Gerencie suas informações" showLogo={false} />
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-1 xim-helper block">E-mail</label>
            <input className="xim-input" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="text-sm mb-1 xim-helper block">Nome de exibição</label>
            <input className="xim-input" value={newName} onChange={(e)=> setNewName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <label className="text-sm mb-1 xim-helper block">Tipo de conta</label>
            <div className="p-3 rounded-lg" style={{background:'var(--brand-surface-alt)'}}>
              <strong>{user?.role === 'admin' ? 'Administrador' : user?.role === 'master' ? 'Master' : 'Usuário'}</strong>
            </div>
          </div>
          {saved && <div className="text-sm" style={{color:'#16a34a'}}>✔ Nome atualizado com sucesso!</div>}
          <div className="flex gap-3">
            <ButtonPrimary onClick={handleSave}>Salvar alterações</ButtonPrimary>
            <ButtonGhost onClick={onClose}>Fechar</ButtonGhost>
          </div>
        </div>
      </div>
    </div>
  );
}



function TelaHistorico({ onClose, onLoadAvaliacao }: { onClose: ()=>void; onLoadAvaliacao: (av: Avaliacao)=>void }){
  const { user } = React.useContext(AuthCtx);
  const avaliacoes = user?.role === 'master' || user?.role === 'admin' ? getAllAvaliacoes() : getAvaliacoesUsuario(user?.id || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  function handleDelete(id: string){
    deleteAvaliacao(id);
    setShowDeleteConfirm(null);
    window.location.reload();
  }

  function formatDate(timestamp: number){
    return new Date(timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-6">
      <div className="xim-card">
        <XimHeader titulo="Histórico de Avaliações" helper={user?.role === 'master' || user?.role === 'admin' ? 'Todas as avaliações do sistema' : 'Suas avaliações'} showLogo={false} />
        {avaliacoes.length === 0 ? (
          <div className="text-center p-6 xim-helper">Nenhuma avaliação encontrada</div>
        ) : (
          <div className="space-y-3">
            {avaliacoes.map(av => (
              <div key={av.id} className="p-4 rounded-lg" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-base" style={{fontWeight:600}}>{buildEnderecoCompleto(av.dados)}</div>
                    <div className="text-sm xim-helper mt-1">Criado em: {formatDate(av.createdAt)}</div>
                    {av.updatedAt !== av.createdAt && (
                      <div className="text-sm xim-helper">Atualizado em: {formatDate(av.updatedAt)}</div>
                    )}
                    {(user?.role === 'master' || user?.role === 'admin') && (
                      <div className="text-sm xim-helper mt-1">Avaliador: {av.userName} ({av.userId})</div>
                    )}
                    <div className="text-sm mt-2"><span className="xim-helper">Valor:</span> <strong>{fmtBRL(av.resultado.valorCentral)}</strong></div>
                    <div className="text-sm"><span className="xim-helper">Faixa:</span> {fmtBRL(av.resultado.valorPiso)} – {fmtBRL(av.resultado.valorTeto)}</div>
                  </div>
                  <div className="flex gap-2">
                    <ButtonPrimary onClick={()=> onLoadAvaliacao(av)}>Abrir</ButtonPrimary>
                    {(user?.role === 'admin' || av.userId === user?.id) && (
                      <ButtonGhost onClick={()=> setShowDeleteConfirm(av.id)}>Excluir</ButtonGhost>
                    )}
                  </div>
                </div>
                {showDeleteConfirm === av.id && (
                  <div className="mt-3 p-3 rounded-lg" style={{background:'#fee2e2', border:'1px solid #ef4444'}}>
                    <div className="text-sm mb-2">Tem certeza que deseja excluir esta avaliação?</div>
                    <div className="flex gap-2">
                      <button className="btn" style={{background:'#ef4444', color:'#fff', borderColor:'#ef4444'}} onClick={()=> handleDelete(av.id)}>Confirmar exclusão</button>
                      <ButtonGhost onClick={()=> setShowDeleteConfirm(null)}>Cancelar</ButtonGhost>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <ButtonGhost onClick={onClose}>Fechar</ButtonGhost>
        </div>
      </div>
    </div>
  );
}



function Resultado({ dados, comps, onBack, avaliacaoId }:{ dados:DadosImovel; comps:Comparavel[]; onBack:()=>void; avaliacaoId?: string }){
  const resultRef = useRef<HTMLDivElement>(null);
  const { user } = React.useContext(AuthCtx);
  const [saved, setSaved] = useState(false);

  const alvoM2 = toNumber(dados.metragem);
  const validBase = useMemo(()=>
    comps
      .map((c)=> ({ ...c, metragem: toNumber(c.metragem), preco: toNumber(c.preco) }))
      .filter((c)=> c.metragem>0 && c.preco>0)
  ,[comps]);

  const pm2Arr = validBase.map(c=> c.preco / c.metragem);
  const { kept } = filterOutliers(pm2Arr);
  const valid = validBase.filter((_,i)=> kept[i]);
  const pm2 = valid.map(c=> c.preco / c.metragem);

  const weights = pm2.map((_,i)=>{
    const a = alvoM2>0? Math.abs(valid[i].metragem as number - alvoM2)/Math.max(alvoM2,1) : 0;
    return 1/(1+a);
  });
  const wSum = weights.reduce((a,b)=>a+b,0) || 1;
  const pm2Weighted = pm2.reduce((acc,v,i)=> acc + v*weights[i], 0) / wSum;

  const media = pm2.reduce((a,b)=>a+b,0)/(pm2.length||1);
  const sd = Math.sqrt(pm2.reduce((a,v)=>a+(v-media)**2,0)/(pm2.length||1));
  const cv = media>0? sd/media : 0.3;
  const delta = Math.min(0.20, 0.5*cv + 0.05);

  const precoM2Central = pm2.length? pm2Weighted : 0;
  const valorCentral = precoM2Central * (alvoM2 || 0);
  const valorPiso = valorCentral * (1 - delta);
  const valorTeto = valorCentral * (1 + delta);

  const confianca = calcConfianca(pm2);

  const ds = dados.dataSecovi || {};
  const dsFilled = !!(ds.unidade && ds.dataUltimaVenda && ds.valorUltimaVenda && toNumber(ds.valorUltimaVenda)>0);
  const dsCalc = dsFilled ? atualizarPorDataSecovi(toNumber(ds.valorUltimaVenda||0), ds.dataUltimaVenda) : { ok:false } as const;
  const dataSecoviDate = dsFilled ? new Date(ds.dataUltimaVenda!) : null;
  const dataSecoviFormatada = dataSecoviDate && !Number.isNaN(dataSecoviDate.getTime())
    ? dataSecoviDate.toLocaleDateString('pt-BR')
    : '-';

  const enderecoCompleto = buildEnderecoCompleto(dados);
      const comparativosInformados = comps.filter((item)=>{
    const link = (item.link || '').trim();
    const bairro = (item.bairro || '').trim();
    const metragem = toNumber(item.metragem);
    const preco = toNumber(item.preco);
    const quartos = String(item.quartos ?? '').trim();
    return link.length>0 || bairro.length>0 || metragem>0 || preco>0 || quartos.length>0;
  });

  function handleSave(){
    if(!user) return;
    const avaliacao: Avaliacao = {
      id: avaliacaoId || "av-" + Date.now() + "-" + Math.random().toString(36).slice(2),
      userId: user.id,
      userName: user.name,
      createdAt: avaliacaoId ? (loadAvaliacoes().find(a => a.id === avaliacaoId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      dados,
      comps,
      resultado:{
        valorCentral,
        valorPiso,
        valorTeto,
        precoM2: precoM2Central,
        confianca
      }
    };
    saveAvaliacao(avaliacao);
    setSaved(true);
    setTimeout(()=> setSaved(false), 2000);
  }

  async function handlePDF(){
    try{
      const pdfMake = await loadPdfMake();
      const comparativoRows = [
        [
          { text:'Im\u00f3vel', style:'tableHeader' },
          { text:'Bairro', style:'tableHeader' },
          { text:'N\u00famero de Quartos', style:'tableHeader' },
          { text:'Metragem (m\u00b2)', style:'tableHeader' },
          { text:'Pre\u00e7o m\u00e9dio do m\u00b2 do im\u00f3vel', style:'tableHeader' },
          { text:'Pre\u00e7o de An\u00fancio', style:'tableHeader' }
        ],
        ...comparativosInformados.map((item, index)=>{
          const link = (item.link && String(item.link).trim().length) ? String(item.link).trim() : '';
          const referencia = `Im\u00f3vel ${String(index + 1).padStart(2, '0')}`;
          const linkCell = link
            ? { text:referencia, link, color:'#2563eb', decoration:'underline', alignment:'center' }
            : { text:referencia, color:'#1f2937', alignment:'center' };
          const metragemNumero = toNumber(item.metragem || 0);
          const precoNumero = toNumber(item.preco || 0);
          const precoMedioM2 = metragemNumero > 0 && precoNumero > 0 ? fmtBRL(precoNumero / metragemNumero) : '-';
          return [
            linkCell,
            { text: item.bairro || '-', alignment:'center' },
            { text: item.quartos ? String(item.quartos) : '-', alignment:'center' },
            { text: fmtM2(item.metragem || 0) || '0,00', alignment:'center' },
            { text: precoMedioM2, alignment:'center' },
            { text: fmtBRL(precoNumero), alignment:'center' }
          ];
        })
      ];

      if(comparativoRows.length === 1){
        comparativoRows.push([
          { text:'Nenhum comparativo preenchido.', colSpan:6, alignment:'center' } as any,
          { text:'', alignment:'center' },
          { text:'', alignment:'center' },
          { text:'', alignment:'center' },
          { text:'', alignment:'center' },
          { text:'', alignment:'center' }
        ]);
      }

      const dsSection = dsFilled && (dsCalc as any).ok ? [
        { text:'DataSecovi', style:'sectionHeader', margin:[0,16,0,6] },
        {
          table:{
            widths:['*','*'],
            headerRows:1 as const,
            body:[
              [
                { text:'Informa\u00e7\u00e3o', style:'tableHeader', alignment:'left' },
                { text:'Valor', style:'tableHeader', alignment:'left' }
              ],
              [
                { text:'\u00daltima Unidade Vendida', alignment:'left' },
                { text: ds!.unidade || '-', alignment:'left' }
              ],
              [
                { text:'Data da Venda', alignment:'left' },
                { text: dataSecoviFormatada, alignment:'left' }
              ],
              [
                { text:'Valor de Venda na Data', alignment:'left' },
                { text: fmtBRL(toNumber(ds!.valorUltimaVenda || 0)), alignment:'left' }
              ],
              [
                { text:'Valor de Venda Atualizado', alignment:'left' },
                { text: fmtBRL((dsCalc as any).atualizado || 0), alignment:'left' }
              ]
            ]
          },
          layout:'lightHorizontalLines',
          margin:[0,0,0,16]
        }
      ] : [];

      const now = new Date();
      const reportDate = now.toLocaleDateString('pt-BR');
      const avaliacaoTitulo = dados.tipoAvaliacao === 'locacao'
        ? 'Avalia\u00e7\u00e3o de Loca\u00e7\u00e3o de Im\u00f3vel'
        : 'Avalia\u00e7\u00e3o de Venda de Im\u00f3vel';
      const metragemFormatada = fmtM2(dados.metragem || 0);
      const metragemDescricao = metragemFormatada ? `${metragemFormatada} m\u00b2` : 'N\u00e3o informado';
      const finalidadeDescricao = dados.finalidade === 'comercial' ? 'Comercial' : 'Residencial';
      const quartosDescricao = dados.finalidade === 'residencial'
        ? (dados.quartos ? String(dados.quartos) : 'N\u00e3o informado')
        : 'N\u00e3o se aplica';
      const corretorResponsavel = (user?.name && user.name.trim()) ? user.name.trim() : (user?.email?.trim() || 'N\u00e3o informado');

      const enderecoPDF = (() => {
        const rua = (dados.logradouro || '').toString().trim();
        const numero = (dados.numero || '').toString().trim();
        const complemento = (dados.complemento || '').toString().trim();
        const bairro = (dados.bairro || '').toString().trim();
        const cidade = (dados.cidade || '').toString().trim();
        const uf = (dados.uf || '').toString().trim();
        const partes: string[] = [];
        if(rua) partes.push(rua);
        if(numero) partes.push(`n.\u00ba ${numero}`);
        if(complemento) partes.push(complemento);
        if(bairro) partes.push(bairro);
        const cidadeUf = cidade && uf ? `${cidade}/${uf}` : cidade || uf;
        if(cidadeUf){
          partes.push(`em ${cidadeUf}`);
        }
        let texto = partes.join(', ');
        if(texto){
          if(!texto.endsWith('.')) texto += '.';
          return texto;
        }
        return enderecoCompleto;
      })();

      const docDefinition = {
        pageMargins: [32, 80, 32, 48],
        header: () => ({
          margin: [32, 28, 32, 0],
          columnGap: 16,
          columns: [
            { image: LOGO_XIMENES_NET, width: 220 },
            {
              width: '*',
              stack: [
                { text: 'Emitido em ' + reportDate, alignment:'right', style:'headerMeta' },
                { text: 'Corretor respons\u00e1vel: ' + corretorResponsavel, alignment:'right', style:'headerMeta' }
              ]
            }
          ]
        }),
        content: [
          { text:avaliacaoTitulo, style:'header' },
          { text:enderecoPDF, style:'subheader', margin:[0,0,0,16] },
          {
            table:{
              widths:['*','*'],
              body:[
                [
                  {
                    stack:[
                      { text:'Valor de Avalia\u00e7\u00e3o', style:'label' },
                      { text:fmtBRL(valorCentral || 0), style:'valueHighlight' }
                    ]
                  },
                  {
                    stack:[
                      { text:'Pre\u00e7o m\u00e9dio do m\u00b2', style:'label' },
                      { text:fmtBRL(precoM2Central || 0), style:'value' }
                    ]
                  }
                ]
              ]
            },
            layout:'noBorders',
            margin:[0,0,0,12]
          },
          {
            columns:[
              { width:'*', stack:[ { text:'Finalidade do im\u00f3vel', style:'label' }, { text:finalidadeDescricao, style:'value' }]},
              { width:'*', stack:[ { text:'N\u00famero de quartos', style:'label' }, { text:quartosDescricao, style:'value' }]},
              { width:'*', stack:[ { text:'Metragem do im\u00f3vel', style:'label' }, { text:metragemDescricao, style:'value' }]}
            ],
            columnGap:12,
            margin:[0,0,0,16]
          },
          ...dsSection,
          { text:'Im\u00f3veis comparativos utilizados', style:'sectionHeader', margin:[0,0,0,6] },
          {
            table:{
              headerRows:1,
              widths:[80,'*',70,70,95,100],
              body: comparativoRows
            },
            layout:'lightHorizontalLines',
            margin:[0,0,0,16]
          },
          { text:'Observa\u00e7\u00f5es', style:'sectionHeader', margin:[0,0,0,6] },
          {
            ol:[
              'Esta avalia\u00e7\u00e3o utiliza o m\u00e9todo comparativo de mercado, considerando im\u00f3veis semelhantes em localiza\u00e7\u00e3o, tipologia, metragem e padr\u00e3o construtivo.',
              'Os valores adotados s\u00e3o pre\u00e7os de an\u00fancio coletados no momento da pesquisa, podendo divergir dos valores efetivamente negociados.',
              'O DataSecovi \u00e9 um indicador do mercado imobili\u00e1rio desenvolvido pelo Secovi-MG, baseado em dados p\u00fablicos da Prefeitura de Belo Horizonte, obtidos por meio do ITBI \u2014 refletindo, portanto, valores reais de transa\u00e7\u00f5es na cidade.',
              'Ao clicar no nome dos im\u00f3veis comparativos apresentados na tabela, voc\u00ea ser\u00e1 direcionado ao link original do an\u00fancio, para consulta das informa\u00e7\u00f5es completas.',
              'Esta \u00e9 uma estimativa indicativa, fundamentada em informa\u00e7\u00f5es fornecidas e em bases p\u00fablicas/privadas, e n\u00e3o substitui uma avalia\u00e7\u00e3o t\u00e9cnica presencial realizada por profissional habilitado.'
            ],
            style:'list',
            margin:[0,0,0,16]
          },
          {
            margin:[0,24,0,0],
            table:{
              widths:[4,'*',4],
              body:[
                [
                  { text:'', fillColor:'#662e8e' },
                  {
                    fillColor:'#f7f8fa',
                    margin:[12,8,12,8],
                    stack:[
                      { text:'"Usamos a Business Intelligence para transformar dados em informa\u00e7\u00e3o que, analisada \u00e0 luz do mercado vigente, \u00e9 base para a nossa avalia\u00e7\u00e3o mercadol\u00f3gica."', style:'quote' },
                      { text:'Cassia Ximenes, CEO da Ximenes Netim\u00f3veis', style:'quoteAuthor' }
                    ]
                  },
                  { text:'', fillColor:'#662e8e' }
                ]
              ]
            },
            layout:{
              hLineWidth:()=>0,
              vLineWidth:()=>0,
              paddingLeft:()=>0,
              paddingRight:()=>0,
              paddingTop:()=>0,
              paddingBottom:()=>0
            }
          }
        ],
        styles:{
          header:{ fontSize:18, bold:true, color:'#662e8e' },
          subheader:{ fontSize:12, color:'#6b7280' },
          sectionHeader:{ fontSize:12, bold:true, color:'#662e8e' },
          label:{ fontSize:10, color:'#6b7280', margin:[0,0,0,2] },
          value:{ fontSize:12, bold:true, color:'#1f2937' },
          valueHighlight:{ fontSize:14, bold:true, color:'#1f2937' },
          tableHeader:{ bold:true, fillColor:'#f3f4f6', color:'#1f2937', fontSize:10, alignment:'center', margin:[0,6,0,6] },
          list:{ fontSize:10, color:'#1f2937' },
          small:{ fontSize:9, color:'#6b7280' },
          headerMeta:{ fontSize:9, color:'#6b7280' },
          quote:{ fontSize:9, color:'#1f2937', italics:true },
          quoteAuthor:{ fontSize:9, color:'#6b7280', margin:[0,8,0,0] }
        },
        defaultStyle:{ fontSize:10, color:'#1f2937' }
      } as any;

      const enderecoLimpo = enderecoPDF.replace(/\s+/g,' ').trim();
      const fileName = `Avaliacao de Imovel - ${enderecoLimpo}.pdf`;
      pdfMake.createPdf(docDefinition).download(fileName);
    }catch(err){
      console.error('Falha ao gerar PDF', err);
      alert('Nao foi possivel gerar o PDF. Tente novamente ou contate o suporte.');
    }
  }

  return (
    <div className="xim-card">
      <XimHeader titulo="Resultado da Avaliação" helper="Resumo da estimativa e evidências de mercado" showLogo={false} />

      <div ref={resultRef}>
        <div className="p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
          <div className="text-3xl" style={{color:'var(--brand-primary)'}}>Valor estimado: <span>{fmtBRL(valorCentral||0)}</span></div>
          <div className="mt-1 text-sm xim-helper">Faixa: <strong>{fmtBRL(valorPiso||0)}</strong> – <strong>{fmtBRL(valorTeto||0)}</strong></div>
          <div className="mt-1 text-sm xim-helper">Preço/m² (central): <strong>{fmtBRL(precoM2Central||0)}</strong></div>
          <div className="mt-1 text-sm"><span className="xim-helper">Endereço:</span> <strong>{enderecoCompleto}</strong></div>
          {dados.finalidade==='residencial' && (
            <div className="mt-1 text-sm"><span className="xim-helper">Quartos:</span> <strong>{String(dados.quartos||'—')}</strong></div>
          )}
        </div>

        {dsFilled && (dsCalc as any).ok ? (
          <div className="mb-2 mt-4 p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
            <div className="text-sm" style={{fontWeight:600}}>DataSecovi - Ultima Unidade Vendida</div>
            <div className="mt-1 text-sm">
              <div><span className="xim-helper">Ultima Unidade Vendida:</span> <strong>{ds!.unidade}</strong></div>
              <div className="mt-1"><span className="xim-helper">Data da Venda:</span> <strong>{dataSecoviFormatada}</strong></div>
              <div className="mt-1"><span className="xim-helper">Valor da Venda:</span> <strong>{fmtBRL(toNumber(ds!.valorUltimaVenda!))}</strong></div>
              <div className="mt-1"><span className="xim-helper">Valor de Venda atualizado:</span> <strong>{fmtBRL((dsCalc as any).atualizado)}</strong></div>
            </div>
          </div>
        ) : null}

        <div className="mb-4 mt-4 p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
          <div className="text-sm" style={{fontWeight:600}}>Imóveis comparativos utilizados</div>
          {comparativosInformados.length ? (
            <ul className="pl-5 text-sm" style={{listStyle:'disc'}}>
              {comparativosInformados.map((it,i)=> {
                const link = (it.link||'').trim();
                const hasLink = link.length>0;
                return (
                  <li key={i}>
                    {hasLink ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="underline" style={{color:'var(--brand-accent)'}}>{link}</a>
                    ) : (
                      <span className="xim-helper">Sem link informado</span>
                    )}
                    {it.bairro? <span className="xim-helper"> - {it.bairro}</span>:null}
                  </li>
                );
              })}
            </ul>
          ) : (<div className="text-sm xim-helper">Nenhum comparativo preenchido.</div>)}
        </div>

        <div className="mb-4 p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
          <div className="text-sm" style={{fontWeight:600}}>Nível de confiança da avaliação</div>
          <div className="mt-1 text-base" style={{fontWeight:600}}>{(confianca*100).toFixed(0)}%</div>
          <div className="mt-1 text-sm xim-helper">Estimativa baseada na quantidade e qualidade dos comparativos (dispersão do preço/m²) e cobertura. Valores podem variar conforme novas evidências de mercado.</div>
        </div>
        <div className="mb-4 quote-box text-sm" style={{fontStyle:'italic'}}>
          "Usamos a Business Intelligence para transformar dados em informação que analisada à luz do mercado vigente é base para a nossa avaliação mercadológica." – Cassia Ximenes, CEO da Ximenes Netimóveis
        </div>
      </div>

      <div className="mt-4" style={{display:'flex', alignItems:'center', gap:12}}>
        <ButtonGhost onClick={onBack}>Voltar</ButtonGhost>
        <ButtonPrimary onClick={handleSave}>Salvar avaliação</ButtonPrimary>
        <ButtonPrimary onClick={handlePDF}>Baixar PDF</ButtonPrimary>
      </div>
      {saved && <div className="mt-2 text-sm" style={{color:'#16a34a'}}>✔ Avaliação salva com sucesso!</div>}
      <hr className="my-6" />
      <div className="text-xs xim-helper">Estimativa indicativa baseada em dados informados e fontes públicas/privadas; não substitui avaliação in loco.</div>
    </div>
  );
}

function AuthShell({ children, onNovaAvaliacao, onShowPerfil, onShowHistorico }: { children: React.ReactNode; onNovaAvaliacao: ()=>void; onShowPerfil: ()=>void; onShowHistorico: ()=>void }){
  const { user, login, register, logout, updateName } = useAuth();
  const [mode,setMode] = useState<"login"|"register">('login');
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');

  if(user){
    const header = (
      <div className="flex items-center justify-between p-3 rounded-xl border bg-white" style={{borderColor:'var(--brand-border)'}}>
        <div className="flex items-center gap-3">
          <img src="/logo-horizontal.png" alt="Ximenes" style={{height:32}} onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
          <div className="text-sm">
            <span className="xim-helper">Logado como</span> <strong>{user.name}</strong>
            <div className="text-xs xim-helper">{user.email} – {user.role === 'admin' ? 'Admin' : user.role === 'master' ? 'Master' : 'Usuário'}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonGhost onClick={onNovaAvaliacao}>+ Nova avaliação</ButtonGhost>
          <ButtonGhost onClick={onShowPerfil}>Perfil</ButtonGhost>
          <ButtonGhost onClick={onShowHistorico}>Histórico</ButtonGhost>
          <button className="btn" onClick={logout}>Sair</button>
        </div>
      </div>
    );

    return (
      <AuthCtx.Provider value={{ user, logout, updateName }}>
        <PageLayout header={header}>
          <div className="space-y-6">
            {children}
          </div>
        </PageLayout>
      </AuthCtx.Provider>
    );
  }

  function handleSubmit(e: React.FormEvent){
    e.preventDefault(); setError('');
    try{ mode==='login' ? login!(email,password) : register!(email,password,name); }
    catch(err:any){ setError(err?.message||'Falha na autenticação'); }
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-2xl border" style={{borderColor:'var(--brand-border)'}}>
          <div className="mb-6">
            <img
              src="/logo-avaliacao.png"
              alt="Ximenes Avaliação"
              style={{height:72, maxWidth:'80%', objectFit:'contain', display:'block', margin:'0 auto'}}
              onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}}
            />
          </div>
          <label className="block text-sm mb-1 xim-helper">E-mail corporativo</label>
          <input type="email" className="xim-input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="seu.nome@ximenes.com.br" required />
          {mode==='register' && (
            <div className="mt-3">
              <label className="block text-sm mb-1 xim-helper">Nome completo</label>
              <input type="text" className="xim-input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Seu nome" required />
            </div>
          )}
          <div className="mt-3">
            <label className="block text-sm mb-1 xim-helper">Senha</label>
            <input type="password" className="xim-input" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          {error && <div className="mt-3 text-sm" style={{color:'#b91c1c'}}>{error}</div>}
          <div className="mt-4 flex items-center justify-between">
            <button type="submit" className="btn btn-primary">{mode==='login'? 'Entrar':'Criar conta'}</button>
            <button type="button" className="btn btn-ghost" onClick={()=>{ setMode(mode==='login'? 'register':'login'); setError(''); }}>{mode==='login'? 'Criar conta':'Já tenho conta'}</button>
          </div>
          <div className="mt-3 text-xs xim-helper">Apenas contas @ximenes.com.br. As credenciais são armazenadas localmente (preview).</div>
        </form>
      </div>
    </PageLayout>
  );
}

function AppFlow(){
  const defaults: DadosImovel = { cep:"", logradouro:"", numero:"", complemento:"", bairro:"", cidade:"", uf:"", finalidade:'residencial', tipoAvaliacao:'venda', quartos:"", metragem:"", dataSecovi:{ unidade:"", dataUltimaVenda:"", valorUltimaVenda:0 } };
  const [step,setStep] = useState<1|2|3>(1);
  const [avaliacaoId, setAvaliacaoId] = useState<string | undefined>(undefined);
  const [dados,setDados] = useState<DadosImovel>(()=>{ try{ return { ...defaults, ...(JSON.parse(localStorage.getItem('xim-dados')||'{}')||{}) }; }catch{ return defaults; } });
  const [compsState,setCompsState] = useState<Comparavel[]>(()=>{
    try{
      const parsed = JSON.parse(localStorage.getItem('xim-comps')||'[]')||[];
      return ensureComparaveis(Array.isArray(parsed) ? parsed : undefined);
    }catch{
      return ensureComparaveis(undefined);
    }
  });

  const setComps: React.Dispatch<React.SetStateAction<Comparavel[]>> = (updater)=>{
    setCompsState((prev)=>{
      const next = typeof updater === 'function' ? (updater as (current: Comparavel[])=>Comparavel[])(prev) : updater;
      return ensureComparaveis(next);
    });
  };

  const comps = compsState;
  
  useEffect(()=>{ try{ localStorage.setItem('xim-dados', JSON.stringify(dados)); }catch{} },[dados]);
  useEffect(()=>{ try{ localStorage.setItem('xim-comps', JSON.stringify(comps)); }catch{} },[comps]);

  useEffect(()=>{
    function handleLoad(e: any){
      const av = e.detail as Avaliacao;
      setAvaliacaoId(av.id);
      setDados(av.dados);
      setComps(ensureComparaveis(av.comps));
      setStep(3);
    }
    window.addEventListener('loadAvaliacao', handleLoad);
    return ()=> window.removeEventListener('loadAvaliacao', handleLoad);
  },[]);

  function handleNovaAvaliacao(){
    setAvaliacaoId(undefined);
    setDados(defaults);
    setComps(ensureComparaveis(undefined));
    setStep(1);
  }

  useEffect(()=>{
    function handleNova(){
      handleNovaAvaliacao();
    }
    window.addEventListener('novaAvaliacao', handleNova);
    return ()=> window.removeEventListener('novaAvaliacao', handleNova);
  },[]);

  return (
    <div className="space-y-6">
      {step===1 && (<DadosDoImovel dados={dados} setDados={setDados} onNext={()=>setStep(2)} />)}
      {step===2 && (<TelaComparativo comps={comps} setComps={setComps} onBack={()=>setStep(1)} onNext={()=>setStep(3)} />)}
      {step===3 && (<Resultado dados={dados} comps={comps} onBack={()=>setStep(2)} avaliacaoId={avaliacaoId} />)}
    </div>
  );
}

function MainApp(){
  const [view, setView] = useState<'flow'|'perfil'|'historico'>('flow');
  const showSmokeTests = import.meta.env.DEV;

  function handleNovaAvaliacao(){
    setView('flow');
    window.dispatchEvent(new CustomEvent('novaAvaliacao'));
  }
  
  return (
    <AuthShell onNovaAvaliacao={handleNovaAvaliacao} onShowPerfil={()=> setView('perfil')} onShowHistorico={()=> setView('historico')}>
      {view === 'flow' && <AppFlow />}
      {view === 'perfil' && <TelaPerfil onClose={()=> setView('flow')} />}
      {view === 'historico' && <TelaHistorico onClose={()=> setView('flow')} onLoadAvaliacao={(av)=> {
        setView('flow');
        window.dispatchEvent(new CustomEvent('loadAvaliacao', { detail: av }));
      }} />}
      {showSmokeTests && <SmokeTests />}
    </AuthShell>
  );
}

export default function App(){
  return <MainApp />;
}
