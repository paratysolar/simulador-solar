/** Fotos da proposta — prioriza config do admin, depois /prop-photos */
const META = [
  { title: 'Residencial — telhado cerâmico', potencia: '5,58 kWp', place: 'Paraty – RJ' },
  { title: 'Comercial — cobertura metálica', potencia: '12,40 kWp', place: 'Costa Verde – RJ' },
  { title: 'Comercial — laje', potencia: '15,50 kWp', place: 'Paraty – RJ' },
  { title: 'Residencial — comissionamento', potencia: '6,20 kWp', place: 'Paraty – RJ' },
  { title: 'Residencial — telha metálica', potencia: '4,96 kWp', place: 'Angra dos Reis – RJ' },
  { title: 'Comercial — usina em laje', potencia: '18,60 kWp', place: 'Paraty – RJ' },
  { title: 'Residencial — telha colonial', potencia: '8,68 kWp', place: 'Costa Verde – RJ' },
  { title: 'Solo — estrutura metálica', potencia: '6,20 kWp', place: 'Paraty – RJ' },
  { title: 'Solo — sistema isolado', potencia: '4,96 kWp', place: 'Paraty – RJ' },
  { title: 'Residencial — telha cerâmica', potencia: '3,72 kWp', place: 'Paraty – RJ' },
  { title: 'Residencial — laje moderna', potencia: '9,92 kWp', place: 'Costa Verde – RJ' },
  { title: 'Residencial — vista Serra', potencia: '4,96 kWp', place: 'Paraty – RJ' },
  { title: 'Rural — galpão metálico', potencia: '24,80 kWp', place: 'Costa Verde – RJ' },
  { title: 'Industrial — galpão', potencia: '49,60 kWp', place: 'Região – RJ' },
  { title: 'Residencial — telha colonial', potencia: '3,10 kWp', place: 'Paraty – RJ' },
];

const FALLBACK_PHOTOS = {
  logo: null,
  cover1: '/prop-photos/20240505_155359.jpg',
  cover2: '/prop-photos/20250211_161337.jpg',
  cover3: '/prop-photos/20240827_142325.jpg',
  portfolio: [
    { src: '/prop-photos/20240222_095716.jpg', title: 'Residencial — telhado cerâmico', potencia: '5,58 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20240224_110459.jpg', title: 'Comercial — cobertura metálica', potencia: '12,40 kWp', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/20240224_110913.jpg', title: 'Comercial — laje', potencia: '15,50 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20240505_155404.jpg', title: 'Residencial — comissionamento', potencia: '6,20 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20240615_102913.jpg', title: 'Residencial — telha metálica', potencia: '4,96 kWp', place: 'Angra dos Reis – RJ' },
    { src: '/prop-photos/20240827_142325.jpg', title: 'Comercial — usina em laje', potencia: '18,60 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20250211_161402.jpg', title: 'Residencial — telha colonial', potencia: '8,68 kWp', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/20250626_114815.jpg', title: 'Solo — estrutura metálica', potencia: '6,20 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20250714_150407.jpg', title: 'Solo — sistema isolado', potencia: '4,96 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20251017_141001.jpg', title: 'Residencial — telha cerâmica', potencia: '3,72 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/20260109_140820.jpg', title: 'Residencial — laje moderna', potencia: '9,92 kWp', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/WhatsApp_Image_2026-09-06_at_15.35.46.jpg', title: 'Residencial — vista Serra', potencia: '4,96 kWp', place: 'Paraty – RJ' },
    { src: '/prop-photos/foto-todos-os-paineis3.jpg', title: 'Rural — galpão metálico', potencia: '24,80 kWp', place: 'Costa Verde – RJ' },
    { src: '/prop-photos/Simulador-De-Energia-Solar-Fotovoltaica-3-1024x576.jpg', title: 'Industrial — galpão', potencia: '49,60 kWp', place: 'Região – RJ' },
    { src: '/prop-photos/images_11.jpg', title: 'Residencial — telha colonial', potencia: '3,10 kWp', place: 'Paraty – RJ' },
  ],
  team: [
    '/prop-photos/20251021_145736.jpg',
    '/prop-photos/WhatsApp_Image_2026-09-06_at_15.35.54.jpg',
    '/prop-photos/WhatsApp_Image_2026-09-06_at_15.35.55_1.jpg',
    '/prop-photos/20240505_155408.jpg',
    '/prop-photos/20260108_094825.jpg',
  ],
};

/** Fotos ativas: config do admin (sessionStorage) → fallback local */
export function getPhotos() {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('ps_proposal_photos');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && (p.cover1 || p.portfolio)) {
          return {
            logo: null,
            cover1: p.cover1 || FALLBACK_PHOTOS.cover1,
            cover2: p.cover2 || FALLBACK_PHOTOS.cover2,
            cover3: p.cover3 || FALLBACK_PHOTOS.cover3,
            portfolio: Array.isArray(p.portfolio) && p.portfolio.length
              ? p.portfolio.map((item, i) => ({
                  src: item.src || item,
                  title: item.title || META[i % META.length]?.title || 'Instalação',
                  potencia: item.potencia || META[i % META.length]?.potencia || '',
                  place: item.place || META[i % META.length]?.place || 'Paraty – RJ',
                }))
              : FALLBACK_PHOTOS.portfolio,
            team: Array.isArray(p.team) && p.team.length ? p.team : FALLBACK_PHOTOS.team,
          };
        }
      }
    } catch (_) {}
  }
  return FALLBACK_PHOTOS;
}

export const PHOTOS = FALLBACK_PHOTOS;

export function fmt(n) {
  return 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR');
}
export function fmtDec(n) {
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function ChartGeracao({ meses, geracao, consumo }) {
  if (!geracao?.length) return null;
  const max = Math.max(...geracao, ...(consumo || []), 1);
  return (
    <div className="chart-wrap">
      <h4>Geração estimada × Consumo informado (kWh/mês)</h4>
      <div className="gen-chart">
        {meses.map((m, i) => (
          <div key={m} className="gen-col">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140 }}>
              <div className="gen-bar g" style={{ height: `${(geracao[i] / max) * 140}px` }} title={`Geração: ${geracao[i]}`} />
              <div className="gen-bar c" style={{ height: `${((consumo?.[i] || 0) / max) * 140}px` }} title={`Consumo: ${consumo?.[i] || 0}`} />
            </div>
            <span className="gen-lbl">{m}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, fontSize: '.78rem' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--g)', borderRadius: 2, marginRight: 4 }} /> Geração</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#94a3b8', borderRadius: 2, marginRight: 4 }} /> Consumo</span>
      </div>
    </div>
  );
}
export function ChartRetorno({ total, economia_ano }) {
  const bars = [];
  let acum = -(total || 0);
  const anual = economia_ano || 0;
  for (let y = 0; y <= 15; y++) {
    if (y === 0) {
      bars.push({ y: 0, v: Math.round(-(total || 0)) });
      continue;
    }
    acum += anual * Math.pow(1.1, y - 1) * Math.pow(0.995, y - 1);
    bars.push({ y, v: Math.round(acum) });
  }
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.v)), 1);
  return (
    <div className="chart-wrap">
      <h4>Retorno de Investimento</h4>
      <div className="bar-chart">
        {bars.map((b) => (
          <div key={b.y} className="bar-col">
            <div
              className="bar"
              style={{
                height: `${(Math.abs(b.v) / maxAbs) * 180}px`,
                background: b.v >= 0 ? '#7dd3fc' : '#fda4af',
              }}
              title={`Ano ${b.y}: ${fmt(b.v)}`}
            />
            <span className="bar-lbl">{b.y}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function TopBar() {
  return (
    <div className="page-topbar">
      <div className="brand-mark">Paraty <span>S<span className="accent">o</span>lar</span></div>
    </div>
  );
}
export const DEFAULT_EQUIP = {
  ongrid: { base: 1780, mid: 1580, large: 1430, xl: 1600 },
  hibrido: { base: 2880, mid: 2580, large: 2280, xl: 2080 },
  offgrid: { base: 5200, mid: 4800, large: 4500, xl: 4200 },
};
