window.PAGE_A = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Simulador de Energia Solar Completo | On-Grid • Off-Grid • Híbrido • ROI</title>
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
 <link rel="stylesheet" href="/sim.css">
</head>
<body>
 <div class="topbar">
 <div class="container topbar-inner">
 <div class="logo">Simulador<span>Solar</span></div>
 <div style="font-size:0.8rem;color:var(--text-muted)">On-Grid • Off-Grid • Híbrido • ROI</div>
      <a href="/crm" style="font-size:0.8rem;color:var(--accent);text-decoration:none;font-weight:500">CRM Leads →</a>
 </div>
 </div>
 <div class="container" id="modeSelect">
 <h1 class="page-title">Escolha o tipo de sistema</h1>
 <p class="page-sub">Simulação completa com captura de leads</p>
 <div class="mode-grid">
 <button class="mode-card" onclick="selectMode('ongrid')"><span class="mode-icon">⚡</span><strong>On-Grid</strong><span>Conectado à rede</span></button>
 <button class="mode-card" onclick="selectMode('offgrid')"><span class="mode-icon">🔋</span><strong>Off-Grid</strong><span>Isolado com baterias</span></button>
 <button class="mode-card" onclick="selectMode('hibrido')"><span class="mode-icon">🔀</span><strong>Híbrido</strong><span>Rede + backup</span></button>
 <button class="mode-card" onclick="selectMode('roi')"><span class="mode-icon">📈</span><strong>ROI</strong><span>Retorno do investimento</span></button>
 </div>
 </div>
`;