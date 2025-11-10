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
      .profile-input-wrapper{ background:var(--brand-surface-alt); border-radius:12px; padding:12px; border:1px solid transparent; transition:border-color .2s, box-shadow .2s; }
      .profile-input-wrapper:focus-within{ border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(102,46,142,.18); }
      .profile-input-wrapper--disabled{ opacity:.7; }
      .profile-input{ width:100%; border:none; background:transparent; font-size:14px; line-height:1.4; }
      .profile-input:focus{ outline:none; }
      .profile-input:disabled{ color:var(--brand-muted); cursor:not-allowed; }
    `}</style>
  );
}

function PageLayout({ header, children }: { header?: React.ReactNode; children: React.ReactNode }){
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
          <img
            src="/mnt/data/logo Ximenes horizontal.png"
            alt="Ximenes"
            style={{height:32}}
            onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}}
          />
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
  const [digits, setDigits] = useState<string>(valueNumber ? String(Math.round(valueNumber*100)) : "");
  const [text, setText] = useState<string>(valueNumber ? fmtBRL(valueNumber) : "");
  const [focused, setFocused] = useState(false);
  useEffect(()=>{ if(focused) return; const d = valueNumber ? String(Math.round(valueNumber*100)) : ""; setDigits(d); setText(valueNumber?fmtBRL(valueNumber):""); },[valueNumber, focused]);
  function handleChange(raw:string){ const clean = raw.replace(/\D/g, ""); setDigits(clean); const {text,value} = formatBRLFromDigits(clean); setText(text); onValueNumber(value); }
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

type ImovelScrape = { bairro: string; metragem: string; preco: number; quartos: string };
type AutofillOrigin = 'direct' | 'proxy';
type AutofillMetricSource = AutofillOrigin | 'cache';
const imovelCache = new Map<string, Promise<ImovelScrape>>();
const sessionCacheData: Record<string, ImovelScrape> = {};
const SESSION_CACHE_KEY = 'xim-scrape-cache-v1';

if(typeof sessionStorage !== 'undefined'){
  try{
    const stored = sessionStorage.getItem(SESSION_CACHE_KEY);
    if(stored){
      const parsed = JSON.parse(stored) as Record<string, ImovelScrape>;
      Object.entries(parsed).forEach(([key, value])=>{
        sessionCacheData[key] = value;
        imovelCache.set(key, Promise.resolve(value));
      });
    }
  }catch(err){
    console.warn('Falha ao carregar cache de imóveis da sessão', err);
  }
}

function persistSessionCache(){
  if(typeof sessionStorage === 'undefined') return;
  try{
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(sessionCacheData));
  }catch(err){
    console.warn('Falha ao salvar cache de imóveis da sessão', err);
  }
}

function nowMs(){
  if(typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
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

function firstSuccessful<T>(tasks: Array<{ promise: Promise<T>; abort: ()=>void }>): Promise<T>{
  return new Promise((resolve, reject)=>{
    if(!tasks.length){
      reject(new Error('Nenhuma tarefa de busca fornecida.'));
      return;
    }
    const errors: any[] = [];
    let pending = tasks.length;
    let settled = false;
    tasks.forEach((task, idx)=>{
      task.promise.then((value)=>{
        if(settled) return;
        settled = true;
        tasks.forEach((t,i)=>{ if(i!==idx) t.abort(); });
        resolve(value);
      }).catch((err)=>{
        errors.push(err);
        pending -= 1;
        if(pending === 0 && !settled){
          reject(errors[0] || new Error('Todas as requisi��es falharam.'));
        }
      });
    });
  });
}


// ===================== Scraper Ximenes =====================
async function fetchImovelXimenes(url: string){
  const normalized = (url||'').trim();
  if(!normalized) return { bairro:"", metragem:"", preco:0, quartos:"" };
  const cached = imovelCache.get(normalized);
  if(cached){
    const startCache = nowMs();
    try{
      const result = await cached;
      logAutofillMetric(normalized, nowMs()-startCache, 'cache');
      return result;
    }catch{
      imovelCache.delete(normalized);
    }
  }else if(sessionCacheData[normalized]){
    const snap = sessionCacheData[normalized];
    logAutofillMetric(normalized, 0, 'cache');
    const promise = Promise.resolve(snap);
    imovelCache.set(normalized, promise);
    return snap;
  }
  const loader = (async ()=>{
    const scrapeStart = nowMs();
    function createTask(target:string, origin:AutofillOrigin){
      const controller = new AbortController();
      const timeout = setTimeout(()=> controller.abort(), 4000);
      const promise = fetch(target, { signal: controller.signal })
        .then(async (r)=>{
          if(!r.ok) throw new Error((origin==='direct'?'HTTP':'Proxy') + " " + r.status);
          const html = await r.text();
          return { html, origin };
        })
        .finally(()=> clearTimeout(timeout));
      return {
        promise,
        abort: ()=>{ clearTimeout(timeout); controller.abort(); }
      };
    }
    async function fetchText(u: string){
      const tasks: Array<{ promise: Promise<{ html:string; origin:AutofillOrigin }>; abort: ()=>void }> = [];
      tasks.push(createTask(u, 'direct'));
      try{
        const p=new URL(u);
        const prox="https://r.jina.ai/" + p.protocol + "//" + p.host + p.pathname + p.search;
        tasks.push(createTask(prox, 'proxy'));
      }catch{}
      return firstSuccessful(tasks);
    }
    function pickNumber(s:string){ const m=(s||"").match(/[0-9.,]+/); if(!m) return ""; const norm=m[0].replace(/\./g,"").replace(",","."); const n=parseFloat(norm); return Number.isFinite(n)? n.toFixed(2):""; }
    const { html, origin } = await fetchText(normalized);
    const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); const lower=text.toLowerCase();
    let bairro=""; const pos=lower.indexOf('c��digo do im��vel'); if(pos>0){ const prev=text.slice(Math.max(0,pos-160),pos).trim(); const tokens=prev.split(' ').filter(Boolean); bairro=tokens.slice(Math.max(0,tokens.length-4)).join(' ').trim(); }
    if(!bairro){ const g=text.match(/([A-Za-zǪ-Ǩ\s\-']+)\s+Belo\s+Horizonte/i); if(g) bairro=(g[1]||"").replace(/\s+/g,' ').trim(); }
    let metragem=""; const ia=lower.indexOf('ǭrea aproximada'); if(ia>=0) metragem=pickNumber(text.slice(ia,ia+80)); if(!metragem){ const mi=text.indexOf('m��'); if(mi>0) metragem=pickNumber(text.slice(Math.max(0,mi-18),mi)); }
    let preco=0; const re=/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi; let m:any; const cand:any[]=[];
    while((m=re.exec(text))){ const valor=toNumber(m[0]); const ctx=text.slice(Math.max(0,m.index-30), Math.min(text.length,m.index+m[0].length+30)).toLowerCase(); let score=1; if(/(��|a) venda|valor|pre��o|venda\b/.test(ctx)) score+=3; if(/aluguel|loca��ǜo|\/mǦs|por mǦs/.test(ctx)) score-=2; if(/condom[i��]nio|iptu|taxa|tarifa/.test(ctx)) score-=5; cand.push({valor,score}); }
    if(cand.length){ cand.sort((a,b)=> b.score-a.score || b.valor-a.valor); preco=cand[0].valor; }
    let quartos=""; const mq=text.match(/(\d{1,2})\s*(quartos?|dormit��rios?)/i); if(mq) quartos=String(Number(mq[1]));
    logAutofillMetric(normalized, nowMs()-scrapeStart, origin);
    return { bairro, metragem, preco, quartos };
  })();
  imovelCache.set(normalized, loader);
  try{
    const result = await loader;
    sessionCacheData[normalized] = result;
    persistSessionCache();
    return result;
  }catch(e){
    imovelCache.delete(normalized);
    console.error("Falha scraping:", e);
    return { bairro:"", metragem:"", preco:0, quartos:"" };
  }
}

// ===================== Telas =====================
function DadosDoImovel({ dados, setDados, onNext }:{ dados:DadosImovel; setDados:(f:DadosImovel)=>void; onNext:()=>void }){
  const [cepMsg,setCepMsg] = useState(""); const lastCep = useRef("");
  async function fetchCEP(raw:string){ if(!raw||raw.length!==8) return; if(lastCep.current===raw) return; lastCep.current=raw; setCepMsg('Buscando endereço&');
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
      <XimHeader titulo="Dados do Imóvel" helper="Preencha as características do alvo" />
      <div className="grid md:grid-cols-12 gap-3 form-grid">
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">CEP</label>
          <input className="xim-input" value={dados.cep||''} onChange={(e)=>setDados({...dados, cep:maskCEP(e.target.value)})} placeholder="30130-000" />
          {cepMsg && <div className="text-sm xim-helper helper-text">{cepMsg}</div>}
        </div>
        <div className="col-span-6 form-field">
          <label className="text-sm xim-helper">Logradouro</label>
          <input className="xim-input" value={dados.logradouro} onChange={(e)=>setDados({...dados, logradouro:e.target.value})} />
        </div>
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">Número</label>
          <input className="xim-input" value={String(dados.numero||'')} onChange={(e)=>setDados({...dados, numero:e.target.value})} />
        </div>
        <div className="col-span-4 form-field">
          <label className="text-sm xim-helper">Complemento</label>
          <input className="xim-input" value={String(dados.complemento||'')} onChange={(e)=>setDados({...dados, complemento:e.target.value})} placeholder="Apto / Sala" />
        </div>
        <div className="col-span-4 form-field">
          <label className="text-sm xim-helper">Bairro</label>
          <input className="xim-input" value={dados.bairro||''} onChange={(e)=>setDados({...dados, bairro:e.target.value})} />
        </div>
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">Cidade</label>
          <input className="xim-input" value={dados.cidade||''} onChange={(e)=>setDados({...dados, cidade:e.target.value})} />
        </div>
        <div className="col-span-1 form-field">
          <label className="text-sm xim-helper">UF</label>
          <input className="xim-input" value={dados.uf||''} onChange={(e)=>setDados({...dados, uf:e.target.value.toUpperCase().slice(0,2)})} />
        </div>
      </div>
      <div className="grid md:grid-cols-12 gap-3 form-grid mt-4">
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">Finalidade</label>
          <select className="xim-input" value={dados.finalidade} onChange={(e)=>setDados({...dados, finalidade:e.target.value as DadosImovel['finalidade']})}>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">Tipo de avaliação</label>
          <select className="xim-input" value={dados.tipoAvaliacao} onChange={(e)=>setDados({...dados, tipoAvaliacao:e.target.value as DadosImovel['tipoAvaliacao']})}>
            <option value="venda">Venda</option>
            <option value="locacao">Locação</option>
          </select>
        </div>
        {dados.finalidade==='residencial' && (
          <div className="col-span-3 form-field">
            <label className="text-sm xim-helper">Quartos</label>
            <input type="number" min={0} className="xim-input" value={String(dados.quartos||'')} onChange={(e)=>setDados({...dados, quartos:e.target.value})} />
          </div>
        )}
        <div className="col-span-3 form-field">
          <label className="text-sm xim-helper">Metragem (m²)</label>
          <input className="xim-input" value={String(dados.metragem||'')} onChange={(e)=>setDados({...dados, metragem:e.target.value})} onBlur={(e)=>setDados({...dados, metragem:fmtM2(e.target.value)})} placeholder="0,00" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-base xim-card-title mb-2">DataSecovi</h3>
        <div className="grid md:grid-cols-12 gap-3 form-grid">
          <div className="col-span-4 form-field">
            <label className="text-sm xim-helper">ýaltima unidade vendida</label>
            <input className="xim-input" value={String(ds.unidade||'')} onChange={(e)=>setDados({...dados, dataSecovi:{...ds, unidade:e.target.value}})} placeholder="Ex.: Torre A - 302" />
          </div>
          <div className="col-span-4 form-field">
            <label className="text-sm xim-helper">Data da última venda</label>
            <input type="date" className="xim-input" value={String(ds.dataUltimaVenda||'')} onChange={(e)=>setDados({...dados, dataSecovi:{...ds, dataUltimaVenda:e.target.value}})} />
            <div className="text-xs xim-helper helper-text">Usaremos apenas o ano.</div>
          </div>
          <div className="col-span-4 form-field">
            <label className="text-sm xim-helper">Valor da última venda</label>
            <MoneyField valueNumber={toNumber(ds.valorUltimaVenda||0)} onValueNumber={(n)=>setDados({...dados, dataSecovi:{...ds, valorUltimaVenda:n}})} placeholder="R$ 0,00" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3"><ButtonPrimary onClick={onNext} disabled={!canNext}>Avançar</ButtonPrimary></div>
    </div>
  );
}

function ComparavelItem({ c, idx, setComps }:{ c:Comparavel; idx:number; setComps:(f:Comparavel[])=>void }){
  const isXimenes = (url:string)=>/^(https?:\/\/)?(www\.)?ximenes\.com\.br\//i.test(String(url||""));
  async function handleBlurLink(link:string){ if(!isXimenes(link)) return; const d=await fetchImovelXimenes(link); setComps((arr)=>arr.map((it,i)=> i===idx ? { ...it, bairro:d.bairro||it.bairro, metragem:d.metragem?fmtM2(d.metragem):it.metragem, preco:d.preco||it.preco, quartos:d.quartos||it.quartos } : it )); }
  return (
    <div className="xim-card">
      <div className="grid md:grid-cols-12 gap-3 form-grid">
        <div className="col-span-6 form-field">
          <label className="text-sm xim-helper">Link do imýývel</label>
          <input
            className="xim-input"
            value={c.link||''}
            onChange={(e)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, link:e.target.value}:it))}
            onBlur={(e)=>handleBlurLink(e.target.value)}
            placeholder="https://www.ximenes.com.br/..."
          />
          {!isXimenes(c.link||'') && (c.link||'').length>0 && (
            <div className="text-xs xim-helper helper-text">Autopreenchimento: apenas domýýnio ximenes.com.br</div>
          )}
        </div>
        <div className="col-span-2 form-field">
          <label className="text-sm xim-helper">Metragem (m²)</label>
          <input className="xim-input" value={String(c.metragem||'')} onChange={(e)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, metragem:e.target.value}:it))} onBlur={(e)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, metragem:fmtM2(e.target.value)}:it))} placeholder="0,00" />
        </div>
        <div className="col-span-2 form-field">
          <label className="text-sm xim-helper">Preço</label>
          <MoneyField valueNumber={toNumber(c.preco||0)} onValueNumber={(val)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, preco:val}:it))} placeholder="R$ 0,00" />
        </div>
        <div className="col-span-2 form-field">
          <label className="text-sm xim-helper">Quartos</label>
          <input type="number" min={0} className="xim-input" value={String(c.quartos||'')} onChange={(e)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, quartos:e.target.value}:it))} placeholder="0" />
        </div>
        <div className="col-span-4 form-field">
          <label className="text-sm xim-helper">Bairro</label>
          <input className="xim-input" value={String(c.bairro||'')} onChange={(e)=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, bairro:e.target.value}:it))} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3"><ButtonPrimary onClick={()=>handleBlurLink(c.link||'')} disabled={!isXimenes(c.link||'')}>Preencher automaticamente</ButtonPrimary><ButtonGhost onClick={()=>setComps((arr)=>arr.map((it,i)=> i===idx?{...it, bairro:"", metragem:"", preco:0, quartos:""}:it))}>Limpar</ButtonGhost></div>
    </div>
  );
}

function TelaComparativo({ comps, setComps, onBack, onNext }:{ comps:Comparavel[]; setComps:(f:Comparavel[])=>void; onBack:()=>void; onNext:()=>void }){
  const canNext = useMemo(()=> comps.filter((c)=> toNumber(c.metragem)>0 && toNumber(c.preco)>0).length>=5 ,[comps]);
  return (
    <div className="space-y-4">
      <XimHeader titulo="Comparativo" helper="Inclua de 5 a 10 imóveis comparativos válidos" />
      {comps.map((c, idx)=>(<ComparavelItem key={idx} c={c} idx={idx} setComps={(next)=>setComps(next)} />))}
      <div className="flex items-center justify-between"><ButtonGhost onClick={()=>setComps(comps.length>1? comps.slice(0,-1): comps)} disabled={comps.length<=1}>Remover último</ButtonGhost><ButtonPrimary onClick={()=>setComps([...comps, { link:"", bairro:"", metragem:"", preco:0, quartos:"" }])} disabled={comps.length>=10}>+ Adicionar comparativo</ButtonPrimary></div>
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
            <div className="profile-input-wrapper profile-input-wrapper--disabled">
              <input className="profile-input" value={user?.email || ''} disabled />
            </div>
          </div>
          <div>
            <label className="text-sm mb-1 xim-helper block">Nome de exibição</label>
            <div className="profile-input-wrapper">
              <input className="profile-input" value={newName} onChange={(e)=> setNewName(e.target.value)} placeholder="Seu nome" />
            </div>
          </div>
          <div>
            <label className="text-sm mb-1 xim-helper block">Tipo de conta</label>
            <div className="profile-input-wrapper">
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
      id: avaliacaoId || `av-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.id,
      userName: user.name,
      createdAt: avaliacaoId ? (loadAvaliacoes().find(a => a.id === avaliacaoId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      dados,
      comps,
      resultado: { valorCentral, valorPiso, valorTeto, precoM2: precoM2Central, confianca }
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
          { text:'Imóvel', style:'tableHeader' },
          { text:'Bairro', style:'tableHeader' },
          { text:'Número de Quartos', style:'tableHeader' },
          { text:'Metragem (m²)', style:'tableHeader' },
          { text:'Preço médio do m² do imóvel', style:'tableHeader' },
          { text:'Preço de Anúncio', style:'tableHeader' }
        ],
        ...comparativosInformados.map((c, index)=>{
          const link = (c.link && String(c.link).trim().length) ? String(c.link).trim() : '';
          const referencia = `Imóvel ${String(index + 1).padStart(2, '0')}`;
          const linkCell = link
            ? { text:referencia, link, color:'#2563eb', decoration:'underline' }
            : { text:referencia, color:'#1c1c1c' };
          const metragemNumero = toNumber(c.metragem || 0);
          const precoNumero = toNumber(c.preco || 0);
          const precoMedioM2 = metragemNumero > 0 && precoNumero > 0 ? fmtBRL(precoNumero / metragemNumero) : '-';
          return [
            linkCell,
            c.bairro || '-',
            c.quartos ? String(c.quartos) : '-',
            { text: fmtM2(c.metragem || 0) || '0,00', alignment:'right' },
            { text: precoMedioM2, alignment:'right' },
            { text: fmtBRL(precoNumero), alignment:'right' }
          ];
        })
      ];
      if(comparativoRows.length === 1){
        comparativoRows.push([
          { text:'Nenhum comparativo preenchido.', colSpan:6, alignment:'center' } as any,
          { text:'' },
          { text:'' },
          { text:'' },
          { text:'' },
          { text:'' }
        ]);
      }

      const dsSection = dsFilled && (dsCalc as any).ok ? [
        { text:'DataSecovi', style:'sectionHeader', margin:[0,16,0,6] },
        {
          table:{
            widths:['*','*'],
            body:[
              [{ text:'Unidade', style:'tableHeader' }, { text: ds!.unidade || '-' }],
              [{ text:'Ano da venda', style:'tableHeader' }, { text: String((dsCalc as any).ano || '-') }],
              [{ text:'Valor de Venda na Data', style:'tableHeader' }, { text: fmtBRL(toNumber(ds!.valorUltimaVenda || 0)) }],
              [{ text:'Valor de Venda Atualizado', style:'tableHeader' }, { text: fmtBRL((dsCalc as any).atualizado || 0) }]
            ]
          },
          layout:'lightHorizontalLines',
          margin:[0,0,0,16]
        }
      ] : [];

      const finalidadeDescricao = dados.finalidade === 'residencial' ? 'Residencial' : 'Comercial';
      const tipoAvaliacaoDescricao = dados.tipoAvaliacao === 'venda' ? 'Venda' : 'Locação';
      const metragemDescricao = `${fmtM2(dados.metragem || 0) || '0,00'} m²`;
      const quartosDescricao = dados.finalidade === 'residencial'
        ? (dados.quartos ? String(dados.quartos) : 'Não informado')
        : 'Não se aplica';
      const comparativosQuantidade = String(comparativosInformados.length);

      const alvoList = [
        `Finalidade: ${finalidadeDescricao}`,
        `Tipo de avaliação: ${tipoAvaliacaoDescricao}`,
        `Metragem alvo: ${metragemDescricao}`,
        `Número de quartos: ${quartosDescricao}`,
        `CEP: ${maskCEP(String(dados.cep ?? '')) || '-'}`,
        `Cidade/UF: ${[dados.cidade, dados.uf].filter(Boolean).join(' / ') || '-'}`
      ];

      const docDefinition = {
        pageMargins: [32, 48, 32, 48],
        content: [
          { text:'Resultado da Avaliação Ximenes', style:'header' },
          { text:enderecoCompleto, style:'subheader', margin:[0,0,0,16] },
          {
            table:{
              widths:['*','auto'],
              body:[
                [
                  {
                    stack:[
                      { text:'Valor de Avaliação', style:'label' },
                      { text:fmtBRL(valorCentral || 0), style:'valueHighlight' }
                    ]
                  },
                  {
                    stack:[
                      { text:'Preço médio do m²', style:'label', alignment:'right' },
                      { text:fmtBRL(precoM2Central || 0), style:'value', alignment:'right' }
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
              { width:'*', stack:[ { text:'Finalidade do imóvel', style:'label' }, { text:finalidadeDescricao, style:'value' }]},
              { width:'*', stack:[ { text:'Número de quartos', style:'label' }, { text:quartosDescricao, style:'value' }]},
              { width:'*', stack:[ { text:'Metragem do imóvel', style:'label' }, { text:metragemDescricao, style:'value' }]}
            ],
            columnGap:12,
            margin:[0,0,0,12]
          },
          {
            columns:[
              { width:'*', stack:[ { text:'Nível de confiança', style:'label' }, { text:`${(confianca*100).toFixed(0)}%`, style:'value' }]},
              { width:'*', stack:[ { text:'Comparativos informados', style:'label' }, { text:comparativosQuantidade, style:'value' }]}
            ],
            columnGap:12,
            margin:[0,0,0,16]
          },
          { text:'Dados do imóvel alvo', style:'sectionHeader' },
          {
            ul: alvoList,
            margin:[0,0,0,16],
            style:'list'
          },
          ...dsSection,
          { text:'Imóveis comparativos utilizados', style:'sectionHeader', margin:[0,0,0,6] },
          {
            table:{
              headerRows:1,
              widths:['auto','*','auto','auto','auto','auto'],
              body: comparativoRows
            },
            layout:'lightHorizontalLines',
            margin:[0,0,0,16]
          },
          { text:'Observações', style:'sectionHeader', margin:[0,0,0,6] },
          { text:'Estimativa indicativa baseada em dados informados e fontes públicas/privadas; não substitui avaliação in loco.', style:'small' },
          {
            margin:[0,12,0,0],
            table:{
              widths:['*'],
              body:[
                [
                  {
                    margin:[12,12,12,12],
                    fillColor:'#f7f8fa',
                    stack:[
                      { text:'"Usamos a Business Intelligence para transformar dados em informação que, analisada à luz do mercado vigente, é base para a nossa avaliação mercadológica."', style:'quote' },
                      { text:'Cassia Ximenes, CEO da Ximenes Netimóveis', style:'quoteAuthor' }
                    ]
                  }
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
          tableHeader:{ bold:true, fillColor:'#f3f4f6', color:'#1f2937', fontSize:10 },
          list:{ fontSize:10, color:'#1f2937' },
          small:{ fontSize:9, color:'#6b7280' },
          quote:{ fontSize:9, color:'#1f2937', italics:true },
          quoteAuthor:{ fontSize:9, color:'#6b7280', margin:[0,8,0,0] }
        },
        defaultStyle:{ fontSize:10, color:'#1f2937' }
      } as any;

      const safeCity = (dados.cidade || 'ximenes').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const dateTag = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const fileName = `${safeCity || 'ximenes'}-avaliacao-${dateTag}.pdf`;
      pdfMake.createPdf(docDefinition).download(fileName);
    }catch(err){
      console.error('Falha ao gerar PDF', err);
      alert('Nýo foi possývel gerar o PDF. Tente novamente ou contate o suporte.');
    }
  }
  return (
    <div className="xim-card">
      <div className="mb-4">
        <h2 className="text-xl xim-card-title">Resultado da Avaliação</h2>
        <p className="text-sm xim-helper mt-1">Resumo da estimativa e evidências de mercado</p>
      </div>
      <div ref={resultRef}>
        <div className="p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
          <div className="text-3xl" style={{color:'var(--brand-primary)'}}>Valor estimado: <span>{fmtBRL(valorCentral||0)}</span></div>
          <div className="mt-1 text-sm xim-helper">Faixa: <strong>{fmtBRL(valorPiso||0)}</strong> ý
 <strong>{fmtBRL(valorTeto||0)}</strong></div>
          <div className="mt-1 text-sm xim-helper">Preço/m² (central): <strong>{fmtBRL(precoM2Central||0)}</strong></div>
          <div className="mt-1 text-sm"><span className="xim-helper">Endereço:</span> <strong>{enderecoCompleto}</strong></div>
          {dados.finalidade==='residencial' && (
            <div className="mt-1 text-sm"><span className="xim-helper">Quartos:</span> <strong>{String(dados.quartos||'ý
')}</strong></div>
          )}
        </div>

        {dsFilled && (dsCalc as any).ok ? (
          <div className="mb-2 mt-4 p-4 rounded-xl" style={{border:'1px solid var(--brand-border)', background:'#fff'}}>
            <div className="text-sm" style={{fontWeight:600}}>DataSecovi ý
 ýaltima unidade vendida</div>
            <div className="mt-1 text-sm">
              <div><span className="xim-helper">Unidade:</span> <strong>{ds!.unidade}</strong></div>
              <div className="mt-1"><span className="xim-helper">Ano da venda:</span> <strong>{(dsCalc as any).ano}</strong></div>
              <div className="mt-1"><span className="xim-helper">Valor na data:</span> <strong>{fmtBRL(toNumber(ds!.valorUltimaVenda!))}</strong></div>
              <div className="mt-1"><span className="xim-helper">Valor atualizado hoje:</span> <strong>{fmtBRL((dsCalc as any).atualizado)}</strong></div>
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
          "Usamos a Business Intelligence para transformar dados em informação que analisada à luz do mercado vigente é base para a nossa avaliação mercadológica." ý
 Cassia Ximenes, CEO da Ximenes Netimóveis
        </div>
      </div>

      <div className="mt-4" style={{display:'flex', alignItems:'center', gap:12}}>
        <ButtonGhost onClick={onBack}>Voltar</ButtonGhost>
        <ButtonPrimary onClick={handleSave}>ýxý Salvar avaliação</ButtonPrimary>
        <ButtonPrimary onClick={handlePDF}>ýx

 Baixar PDF</ButtonPrimary>
      </div>
      {saved && <div className="mt-2 text-sm" style={{color:'#16a34a'}}>ýS
 Avaliação salva com sucesso!</div>}
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
          <img src="/mnt/data/logo Ximenes horizontal.png" alt="Ximenes" style={{height:32}} onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
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
          <div className="flex items-center gap-3 mb-4">
            <img src="/mnt/data/logo Ximenes vertical.png" alt="Ximenes" style={{height:40}} onError={(e:any)=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
            <h1 className="text-lg xim-card-title">Acesso à Avaliação Ximenes</h1>
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
  const [comps,setComps] = useState<Comparavel[]>(()=>{ try{ const parsed=JSON.parse(localStorage.getItem('xim-comps')||'[]')||[]; return Array.isArray(parsed)&&parsed.length? parsed : [{ link:"", bairro:"", metragem:"", preco:0, quartos:"" }]; }catch{ return [{ link:"", bairro:"", metragem:"", preco:0, quartos:"" }]; } });
  
  useEffect(()=>{ try{ localStorage.setItem('xim-dados', JSON.stringify(dados)); }catch{} },[dados]);
  useEffect(()=>{ try{ localStorage.setItem('xim-comps', JSON.stringify(comps)); }catch{} },[comps]);

  useEffect(()=>{
    function handleLoad(e: any){
      const av = e.detail as Avaliacao;
      setAvaliacaoId(av.id);
      setDados(av.dados);
      setComps(av.comps);
      setStep(3);
    }
    window.addEventListener('loadAvaliacao', handleLoad);
    return ()=> window.removeEventListener('loadAvaliacao', handleLoad);
  },[]);

  function handleNovaAvaliacao(){
    setAvaliacaoId(undefined);
    setDados(defaults);
    setComps([{ link:"", bairro:"", metragem:"", preco:0, quartos:"" }]);
    setStep(1);
  }

  useEffect(()=>{
    function handleNova(){ handleNovaAvaliacao(); }
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

}

