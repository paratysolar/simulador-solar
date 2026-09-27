import { REAL_PHOTOS } from './photo-data';

const META = [
  { seg: 'Residencial', cid: 'Paraty - RJ', mods: 12, gen: '420 kWh/mês', econ: 'R$ 380' },
  { seg: 'Comercial', cid: 'Paraty - RJ', mods: 24, gen: '890 kWh/mês', econ: 'R$ 780' },
  { seg: 'Residencial', cid: 'Costa Verde - RJ', mods: 10, gen: '360 kWh/mês', econ: 'R$ 320' },
  { seg: 'Residencial', cid: 'Paraty - RJ', mods: 16, gen: '580 kWh/mês', econ: 'R$ 520' },
  { seg: 'Comercial', cid: 'Angra dos Reis - RJ', mods: 32, gen: '1.150 kWh/mês', econ: 'R$ 980' },
  { seg: 'Residencial', cid: 'Paraty - RJ', mods: 14, gen: '500 kWh/mês', econ: 'R$ 450' },
  { seg: 'Residencial', cid: 'Costa Verde - RJ', mods: 8, gen: '290 kWh/mês', econ: 'R$ 260' },
  { seg: 'Comercial', cid: 'Paraty - RJ', mods: 40, gen: '1.420 kWh/mês', econ: 'R$ 1.200' },
  { seg: 'Residencial', cid: 'Paraty - RJ', mods: 18, gen: '650 kWh/mês', econ: 'R$ 580' },
];

/** Fotos reais Paraty Solar (HEIC convertidos → base64) */
export const PHOTOS = {
  logo: null,
  cover1: REAL_PHOTOS.cover1,
  cover2: REAL_PHOTOS.cover2,
  cover3: REAL_PHOTOS.cover3,
  portfolio: REAL_PHOTOS.portfolio.map((src, i) => ({ src, ...META[i] })),
  team: REAL_PHOTOS.team,
};
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
