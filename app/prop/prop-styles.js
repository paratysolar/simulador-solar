export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;600;700&display=swap');

:root {
  --navy: #0b2c6b;
  --navy2: #0d3d8c;
  --blue: #1a56a8;
  --orange: #f39c12;
  --orange2: #e67e22;
  --green: #27ae60;
  --red: #c0392b;
  --g: #1a9e5c;
  --m: #64748b;
  --bg: #f5f7fb;
  --line: #e2e8f0;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Open Sans', system-ui, sans-serif; background: var(--bg); color: #1e293b; }

.wrap { max-width: 920px; margin: 0 auto; padding: 20px 16px 60px; }
.login { max-width: 380px; margin: 80px auto; padding: 36px 32px; background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(11,44,107,.12); text-align: center; }
.login h1 { font-family: Montserrat, sans-serif; font-size: 1.5rem; color: var(--navy); margin: 12px 0 4px; }
.login .sub { color: var(--m); font-size: .9rem; margin-bottom: 20px; }
.login input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 10px; font-size: 1rem; margin-bottom: 12px; }
.logo-txt { font-family: Montserrat, sans-serif; font-weight: 800; font-size: 1.4rem; color: var(--navy); }
.logo-txt span { color: var(--orange); }

.card { background: #fff; border-radius: 14px; padding: 22px 24px; margin-bottom: 18px; box-shadow: 0 2px 16px rgba(0,0,0,.05); }
.card h1 { font-family: Montserrat, sans-serif; font-size: 1.35rem; color: var(--navy); }
.modes { display: flex; gap: 8px; margin-bottom: 16px; }
.mode { flex: 1; padding: 10px; border: 1.5px solid var(--line); border-radius: 10px; background: #fff; cursor: pointer; font-weight: 600; font-size: .9rem; color: var(--m); }
.mode.on { border-color: var(--navy); background: var(--navy); color: #fff; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
label { display: block; font-size: .78rem; font-weight: 600; color: var(--m); margin-bottom: 4px; }
input, select { width: 100%; padding: 10px 12px; border: 1.5px solid var(--line); border-radius: 8px; font-size: .95rem; margin-bottom: 8px; }
.btn { background: var(--navy); color: #fff; border: none; padding: 12px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: .95rem; }
.btn:hover { background: var(--navy2); }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn-out { background: #fff; color: var(--navy); border: 1.5px solid var(--navy); padding: 10px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.err { color: var(--red); font-size: .88rem; margin: 8px 0; }
.list { list-style: none; }
.list li { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: .9rem; }
.list li:hover { background: #f8fafc; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }

.proposta { background: transparent; }
.page {
  width: 100%;
  max-width: 794px;
  margin: 0 auto 28px;
  background: #fff;
  box-shadow: 0 4px 28px rgba(11,44,107,.1);
  border-radius: 4px;
  overflow: hidden;
  page-break-after: always;
  position: relative;
}
.page:last-of-type { page-break-after: auto; }

.cover {
  min-height: 1050px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
}
.cover-top {
  background: linear-gradient(145deg, #071e42 0%, #0b2c6b 45%, #1565c0 100%);
  padding: 56px 40px 40px;
  text-align: center;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.cover-top::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, transparent 40%, rgba(255,255,255,.04) 40%, rgba(255,255,255,.04) 60%, transparent 60%),
    linear-gradient(225deg, transparent 30%, rgba(0,0,0,.08) 30%);
  pointer-events: none;
}
.cover-top h1 {
  font-family: Montserrat, sans-serif;
  font-size: 3.2rem;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
  position: relative;
  text-shadow: 0 2px 12px rgba(0,0,0,.2);
}
.cover-top .tagline {
  color: var(--orange);
  font-family: Montserrat, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 14px;
  position: relative;
}
.cover-circles {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin: 36px 0 28px;
  position: relative;
  z-index: 1;
}
.cover-circles img {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--orange);
  box-shadow: 0 8px 28px rgba(0,0,0,.25);
  background: #fff;
}
.cover-circles img.main {
  width: 180px;
  height: 180px;
  border-width: 6px;
  z-index: 2;
}
.cover-mid {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 40px 20px;
  background: #fff;
}
.cover-logo-name {
  font-family: Montserrat, sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--orange);
  letter-spacing: -0.02em;
}
.cover-logo-name span { color: var(--navy); }
.cover-logo-sub {
  font-family: Montserrat, sans-serif;
  font-size: .95rem;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: .18em;
  text-transform: uppercase;
  margin-top: 4px;
}
.cover-footer {
  background: linear-gradient(90deg, #071e42, #0b2c6b);
  color: #fff;
  padding: 22px 36px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  font-size: .88rem;
  line-height: 1.55;
}

.page-inner {
  padding: 28px 44px 48px;
  min-height: 1000px;
  position: relative;
  background: #fff;
}
.page-topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.page-topbar .brand-mark {
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: .95rem;
  color: var(--navy);
}
.page-topbar .brand-mark span { color: var(--orange); }
.page-num {
  position: absolute;
  bottom: 18px;
  right: 36px;
  font-size: .8rem;
  color: #94a3b8;
}

.title-orange {
  font-family: Montserrat, sans-serif;
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--orange);
  margin-bottom: 6px;
  border-bottom: 2.5px solid #1e293b;
  padding-bottom: 6px;
  display: inline-block;
  min-width: 280px;
}
.title-blue {
  font-family: Montserrat, sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--blue);
  margin: 22px 0 10px;
  font-style: italic;
}
.client-name {
  font-family: Montserrat, sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 18px 0 4px;
}
.client-loc { color: #475569; font-size: .95rem; margin-bottom: 20px; }
.body {
  font-size: .95rem;
  line-height: 1.65;
  color: #334155;
  margin-bottom: 12px;
}
.body strong { color: #0f172a; }

.intro-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  align-items: start;
}
.intro-illust {
  background: linear-gradient(160deg, #e8f4fd, #f0f9ff);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.intro-illust img { max-width: 100%; border-radius: 12px; }

.flow-page { padding-bottom: 20px; }
.flow-title {
  font-family: Montserrat, sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 28px;
}
.flow-top {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.flow-step { text-align: center; width: 160px; }
.flow-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--orange);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 2rem;
  box-shadow: 0 6px 20px rgba(243,156,18,.35);
}
.flow-icon.sol { background: linear-gradient(145deg, #f39c12, #e67e22); }
.flow-lbl {
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: .82rem;
  color: var(--orange);
  letter-spacing: .04em;
  text-transform: uppercase;
}
.flow-desc {
  font-size: .78rem;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.35;
  border-bottom: 2px solid #cbd5e1;
  padding-bottom: 6px;
  display: inline-block;
}
.flow-val {
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  margin-top: 8px;
}
.flow-val.red { color: var(--red); }
.flow-val.green { color: var(--green); }
.flow-arrow {
  font-size: 1.8rem;
  color: #94a3b8;
  padding-top: 28px;
  font-weight: 300;
}

.banner-blue {
  background: linear-gradient(90deg, #1a56a8, #2563eb);
  color: #fff;
  text-align: center;
  padding: 12px 20px;
  border-radius: 999px;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  font-size: .88rem;
  letter-spacing: .02em;
  margin: 28px auto 22px;
  max-width: 520px;
  box-shadow: 0 4px 16px rgba(26,86,168,.3);
}

.two-ways {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin: 16px 0 12px;
  align-items: start;
}
.way { text-align: center; padding: 8px 12px; }
.way-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--orange);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 1.6rem;
  box-shadow: 0 4px 14px rgba(243,156,18,.3);
}
.way h4 {
  font-family: Montserrat, sans-serif;
  color: var(--orange);
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: .03em;
}
.way ul {
  list-style: none;
  text-align: left;
  display: inline-block;
  font-size: .92rem;
  color: #334155;
  line-height: 1.7;
}
.way ul li::before {
  content: '•';
  color: var(--orange);
  font-weight: 800;
  margin-right: 8px;
}
.way-price {
  font-family: Montserrat, sans-serif;
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 12px 0 8px;
}
.way-note {
  font-size: .8rem;
  color: #64748b;
  line-height: 1.5;
  text-align: left;
  margin-top: 10px;
}
.way-note strong { color: var(--navy); }

.resultado-final {
  text-align: center;
  margin-top: 28px;
  padding: 24px 16px 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(14,165,233,.06) 100%);
  border-radius: 12px;
}
.resultado-final .rf-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--orange);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 1.6rem;
  box-shadow: 0 4px 16px rgba(243,156,18,.35);
}
.resultado-final .rf-lbl {
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  color: var(--orange);
  font-size: .9rem;
  letter-spacing: .06em;
}
.resultado-final .rf-sub {
  font-size: .88rem;
  color: #475569;
  margin: 6px 0 14px;
}
.lucro-box {
  display: inline-block;
  border: 3px solid var(--orange);
  background: #fff;
  padding: 12px 28px;
  border-radius: 6px;
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(243,156,18,.15);
}

.kit-list {
  list-style: none;
  margin: 12px 0 18px;
  font-size: .95rem;
  line-height: 1.75;
  color: #334155;
}
.kit-list li::before {
  content: '●';
  color: var(--orange);
  margin-right: 10px;
  font-size: .7rem;
  vertical-align: middle;
}
.conta-line { font-size: 1rem; margin: 8px 0; }
.conta-line .sem { color: var(--red); font-weight: 700; }
.conta-line .com { color: var(--green); font-weight: 700; }
.conta-line .gen { color: var(--blue); font-weight: 700; }

.cond-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 12px;
  font-size: .9rem;
  border: 1px solid #93c5fd;
}
.cond-table th, .cond-table td {
  border: 1px solid #93c5fd;
  padding: 10px 14px;
  text-align: left;
}
.cond-table tr:nth-child(odd) { background: #dbeafe; }
.cond-table tr:nth-child(even) { background: #fff; }
.cond-table .inv-row { background: #93c5fd !important; font-weight: 800; font-size: 1.05rem; }
.cond-table .inv-row td { color: var(--navy); }
.fine-print {
  font-size: .75rem;
  color: #64748b;
  font-style: italic;
  margin-top: 12px;
  line-height: 1.45;
}

.chart-wrap {
  margin: 20px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--line);
}
.chart-wrap h4 {
  text-align: center;
  font-family: Montserrat, sans-serif;
  color: #b91c1c;
  font-size: 1.05rem;
  margin-bottom: 12px;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  gap: 4px;
  padding: 0 4px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  max-width: 28px;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
}
.bar-lbl { font-size: .65rem; color: #94a3b8; margin-top: 4px; }

.gen-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  gap: 6px;
}
.gen-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  gap: 2px;
}
.gen-bar {
  width: 40%;
  min-width: 8px;
  border-radius: 2px 2px 0 0;
  display: inline-block;
}
.gen-bar.g { background: var(--g); }
.gen-bar.c { background: #94a3b8; }
.gen-lbl { font-size: .65rem; color: #94a3b8; margin-top: 4px; }

.port-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-top: 16px;
}
.port-card {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #fff;
}
.port-card img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
}
.port-card .cap {
  padding: 8px 10px;
  font-size: .75rem;
  color: #475569;
}

.signature { margin-top: 36px; }
.signature .line {
  width: 280px;
  border-top: 1px solid #94a3b8;
  margin: 36px 0 8px;
}
.signature .name {
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  color: var(--navy);
}
.footer-contact {
  margin-top: 48px;
  text-align: center;
  font-size: .88rem;
  color: #475569;
  line-height: 1.7;
  border-top: 1px solid var(--line);
  padding-top: 20px;
}
.footer-contact strong { color: var(--navy); }
.notes-list {
  margin: 12px 0 20px 18px;
  font-size: .92rem;
  line-height: 1.7;
  color: #334155;
}

@media print {
  body { background: #fff; }
  .no-print, .toolbar, .card.no-print { display: none !important; }
  .wrap { max-width: 100%; padding: 0; }
  .page {
    box-shadow: none;
    margin: 0;
    border-radius: 0;
    page-break-after: always;
    max-width: 100%;
  }
  .page-inner { min-height: auto; padding: 20px 28px 36px; }
  .cover { min-height: 100vh; }
  .cover-top { padding: 40px 28px 28px; }
  .cover-top h1 { font-size: 2.6rem; }
  .cover-circles img { width: 120px; height: 120px; }
  .cover-circles img.main { width: 148px; height: 148px; }
}

@media (max-width: 640px) {
  .page-inner { padding: 20px 16px 40px; min-height: auto; }
  .cover-top h1 { font-size: 2rem; }
  .cover-circles { gap: 8px; }
  .cover-circles img { width: 90px; height: 90px; }
  .cover-circles img.main { width: 110px; height: 110px; }
  .cover-footer { grid-template-columns: 1fr; font-size: .8rem; }
  .flow-top { flex-wrap: wrap; }
  .two-ways { grid-template-columns: 1fr; }
  .intro-grid { grid-template-columns: 1fr; }
  .port-grid { grid-template-columns: 1fr 1fr; }
  .row { grid-template-columns: 1fr; }
}
`;
