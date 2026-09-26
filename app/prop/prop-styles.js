export const STYLES = `
  :root {
    --g: #00A86B; --gd: #008855; --g2: #00C878;
    --navy: #0B2545; --navy2: #163A5F;
    --orange: #F5A623; --t: #1a2e28; --m: #5a6b66;
    --b: #e2e8e5; --bg: #f4f7f5; --white: #fff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--t); }
  .wrap { max-width: 920px; margin: 0 auto; padding: 20px 16px 80px; }
  .logo-txt { font-weight: 800; color: var(--g); font-size: 1.3rem; letter-spacing: -0.02em; }
  .logo-txt span { color: var(--navy); font-weight: 600; }
  h1 { font-size: 1.45rem; margin-bottom: 4px; }
  .sub { color: var(--m); font-size: .88rem; margin-bottom: 18px; }
  .card { background: #fff; border: 1px solid var(--b); border-radius: 14px; padding: 22px; margin-bottom: 16px; }
  label { display: block; font-size: .78rem; color: var(--m); margin-bottom: 4px; font-weight: 600; }
  input, select { width: 100%; padding: 10px 12px; border: 1.5px solid var(--b); border-radius: 8px; font: inherit; margin-bottom: 12px; }
  input:focus, select:focus { outline: none; border-color: var(--g); }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modes { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .mode { padding: 9px 16px; border: 1.5px solid var(--b); border-radius: 999px; background: #fff; cursor: pointer; font-weight: 600; font-size: .88rem; }
  .mode.on { background: var(--g); color: #fff; border-color: var(--g); }
  .btn { background: var(--g); color: #fff; border: 0; border-radius: 999px; padding: 12px 26px; font-weight: 700; font-size: .95rem; cursor: pointer; }
  .btn:hover { background: var(--gd); }
  .btn:disabled { background: #9ca3af; cursor: not-allowed; }
  .btn-out { background: #fff; color: var(--g); border: 1.5px solid var(--g); border-radius: 999px; padding: 8px 16px; font-weight: 600; cursor: pointer; }
  .err { color: #e53e3e; font-size: .88rem; margin: 8px 0; }
  .login { max-width: 360px; margin: 80px auto; text-align: center; }
  .list { font-size: .85rem; }
  .list li { padding: 10px 0; border-bottom: 1px solid var(--b); display: flex; justify-content: space-between; gap: 8px; cursor: pointer; }
  .list li:hover { color: var(--g); }
  @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }

  .proposta { background: #fff; }
  .page { page-break-after: always; padding: 0; margin: 0 0 28px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
  .page:last-child { page-break-after: auto; }

  .cover {
    min-height: 720px; background: linear-gradient(160deg, #0B2545 0%, #0d3d2e 45%, #00A86B 100%);
    color: #fff; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 48px 32px 0; text-align: center;
  }
  .cover h1 { font-size: 2.8rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.05; margin: 12px 0 8px; color: #fff; }
  .cover .tagline { color: var(--orange); font-size: 1.15rem; font-weight: 600; margin-bottom: 28px; }
  .cover-circles { display: flex; gap: 18px; justify-content: center; align-items: center; margin: 20px 0 32px; flex-wrap: wrap; }
  .cover-circles img {
    width: 140px; height: 140px; border-radius: 50%; object-fit: cover;
    border: 4px solid var(--orange); box-shadow: 0 8px 24px rgba(0,0,0,.35);
  }
  .cover-circles img.main { width: 170px; height: 170px; border-width: 5px; }
  .cover-brand { margin-top: 8px; }
  .cover-brand .name { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
  .cover-brand .name span { color: var(--orange); }
  .cover-brand .sub-b { font-size: .85rem; opacity: .85; letter-spacing: .12em; text-transform: uppercase; margin-top: 2px; }
  .cover-footer {
    width: 100%; background: rgba(0,0,0,.25); padding: 18px 28px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
    font-size: .82rem; text-align: left; margin-top: auto;
  }

  .page-inner { padding: 36px 40px 28px; min-height: 680px; position: relative; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 2px solid var(--g); }
  .page-header .brand { font-weight: 800; color: var(--g); font-size: 1.05rem; }
  .page-header .brand span { color: var(--navy); font-weight: 600; }
  .page-num { position: absolute; bottom: 16px; right: 28px; font-size: .75rem; color: var(--m); }
  .sec-title { font-size: 1.35rem; font-weight: 700; color: var(--navy); margin: 0 0 14px; }
  .sec-title.green { color: var(--g); }
  p.body { font-size: .95rem; line-height: 1.65; color: #334; margin-bottom: 14px; }
  .client-name { font-size: 1.5rem; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .client-loc { color: var(--m); margin-bottom: 20px; }

  .flow { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 24px 0; }
  .flow-item { text-align: center; max-width: 160px; }
  .flow-circle {
    width: 72px; height: 72px; border-radius: 50%; background: var(--orange); color: #fff;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 1.6rem; font-weight: 800;
  }
  .flow-circle.green { background: var(--g); }
  .flow-circle.navy { background: var(--navy); }
  .flow-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; color: var(--m); letter-spacing: .04em; }
  .flow-val { font-size: 1.05rem; font-weight: 800; margin-top: 2px; }
  .flow-arrow { font-size: 1.5rem; color: var(--orange); font-weight: 700; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
  .box { border-radius: 12px; padding: 18px; border: 1.5px solid var(--b); background: #fafcfb; }
  .box h4 { font-size: .9rem; font-weight: 700; margin-bottom: 8px; color: var(--navy); }
  .box ul { padding-left: 18px; font-size: .88rem; line-height: 1.55; color: #445; }
  .box.highlight { border-color: var(--g); background: linear-gradient(135deg, #e8f8f0, #f0faf5); }
  .box.orange-box { border-color: var(--orange); background: #fffbf3; }

  .big-price { font-size: 1.8rem; font-weight: 900; color: var(--g); }

  table.cond { width: 100%; border-collapse: collapse; font-size: .88rem; margin: 16px 0; }
  table.cond th, table.cond td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--b); }
  table.cond tr:nth-child(even) td { background: #f7faf8; }
  table.cond .inv { font-weight: 800; color: var(--g); font-size: 1.05rem; }

  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
  .kpi { background: linear-gradient(145deg, #f0faf5, #fff); border: 1px solid #d4ebe0; border-radius: 12px; padding: 14px; text-align: center; }
  .kpi .v { font-size: 1.25rem; font-weight: 800; color: var(--g); }
  .kpi .l { font-size: .72rem; color: var(--m); margin-top: 2px; text-transform: uppercase; letter-spacing: .03em; }

  .chart-wrap { margin: 20px 0; padding: 16px; background: #f8faf9; border-radius: 12px; }
  .chart-wrap h4 { text-align: center; color: var(--navy); margin-bottom: 12px; font-size: 1rem; }
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 180px; padding: 0 8px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; max-width: 36px; border-radius: 4px 4px 0 0; background: #5b9bd5; min-height: 4px; }
  .bar-lbl { font-size: .65rem; color: var(--m); margin-top: 4px; }

  .gen-chart { display: flex; align-items: flex-end; gap: 4px; height: 160px; }
  .gen-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 2px; }
  .gen-bar { width: 100%; max-width: 22px; border-radius: 3px 3px 0 0; }
  .gen-bar.g { background: var(--g); }
  .gen-bar.c { background: #94a3b8; opacity: .7; }
  .gen-lbl { font-size: .6rem; color: var(--m); }

  .portfolio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px; }
  .port-card { border-radius: 10px; overflow: hidden; border: 1px solid var(--b); background: #fff; }
  .port-card img { width: 100%; height: 120px; object-fit: cover; display: block; }
  .port-card .info { padding: 8px 10px; font-size: .72rem; line-height: 1.4; color: #445; }
  .port-card .info strong { display: block; color: var(--navy); font-size: .78rem; margin-bottom: 2px; }

  .bom-table { width: 100%; border-collapse: collapse; font-size: .85rem; margin: 12px 0; }
  .bom-table th, .bom-table td { padding: 8px 10px; border-bottom: 1px solid var(--b); text-align: left; }
  .bom-table th { color: var(--m); font-weight: 600; font-size: .78rem; }
  .bom-table .tot-row td { font-weight: 800; color: var(--g); font-size: 1.05rem; border-top: 2px solid var(--g); }

  .notes-list { font-size: .88rem; line-height: 1.6; color: #445; padding-left: 18px; }
  .notes-list li { margin-bottom: 6px; }

  .signature { margin-top: 40px; text-align: center; }
  .signature .line { width: 220px; border-top: 1px solid #333; margin: 40px auto 8px; }
  .signature .name { font-weight: 700; }
  .footer-brand { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--b); }
  .footer-brand .name { font-size: 1.3rem; font-weight: 800; color: var(--g); }
  .footer-brand .name span { color: var(--navy); }
  .footer-brand .contact { font-size: .8rem; color: var(--m); margin-top: 6px; line-height: 1.5; }

  .lucro-box {
    margin: 20px auto; max-width: 420px; text-align: center; padding: 14px 20px;
    border: 2px solid var(--orange); border-radius: 10px; background: #fffbf3;
    font-weight: 800; font-size: 1.1rem; color: var(--navy);
  }

  .toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    .wrap { max-width: 100%; padding: 0; }
    .page { border: none; box-shadow: none; margin: 0; border-radius: 0; page-break-after: always; }
    .page-inner { min-height: auto; }
    .cover { min-height: 100vh; }
  }
  @media (max-width: 700px) {
    .kpi-row { grid-template-columns: 1fr 1fr; }
    .portfolio-grid { grid-template-columns: 1fr 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .page-inner { padding: 24px 18px; }
    .cover h1 { font-size: 2rem; }
    .cover-circles img { width: 100px; height: 100px; }
    .cover-circles img.main { width: 120px; height: 120px; }
  }
`;
