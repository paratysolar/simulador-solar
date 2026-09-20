# Simulador Solar Completo + CRM Embutido

Simulador de energia solar (estilo Intelbras) com **4 modos**, captura de leads no **Vercel Blob** e **CRM embutido** protegido por senha.

## URLs

| Página | Caminho |
|--------|---------|
| Simulador | `/` ou `/index.html` |
| CRM Leads | `/crm` |

**Domínios Vercel (time INTELBRAS SOLAR):**
- https://simulador-solar-zeta.vercel.app
- https://simulador-solar-intelbras-solar.vercel.app

> Se o time tiver SSO/Vercel Authentication ativo, acesse pelo dashboard Vercel ou desative a proteção em **Project → Settings → Deployment Protection**.

## Modos do simulador

| Modo | O que calcula |
|------|----------------|
| **On-Grid** | kWp, área, custo, geração, economia anual, payback |
| **Off-Grid** | Tabela de cargas, autonomia, Ah, kWp, inversor, custo |
| **Híbrido** | FV + bateria de backup (kWh), custo, payback |
| **ROI** | ROI %, payback e economia líquida (degradação + manutenção) |

Recursos em todos os modos:
- Checkbox **“Sou humano”** (obrigatório para calcular)
- **CEP automático** via ViaCEP → preenche cidade/UF e HSP
- Botão **Salvar lead** → grava no Vercel Blob + localStorage

## CRM embutido (`/crm`)

1. Abra `/crm`
2. Senha padrão: **`solar2026`** (variável de ambiente `CRM_PASSWORD`)
3. Dashboard com:
   - Contadores por modo (On-Grid / Off-Grid / Híbrido / ROI)
   - Filtro por modo e busca textual
   - Tabela de leads (data, contato, cidade, resumo)
   - Detalhe completo em JSON ao clicar em **Ver**

## Stack

- **Next.js 14** (App Router)
- **API** `POST /api/leads` → grava JSON no **Vercel Blob** (`leads/{mode}/{id}.json`)
- **API** `GET /api/leads?full=1&auth=SENHA` → lista leads (autenticado)
- Frontend estático em `public/` (HTML gzip-loader + `sim.js` + `sim.css`)
- CRM em React: `app/crm/page.js`

## Variáveis de ambiente (já configuradas no projeto)

| Variável | Uso |
|----------|-----|
| `BLOB_READ_WRITE_TOKEN` | Token do Blob Store (injetado ao criar o store) |
| `CRM_PASSWORD` | Senha do painel `/crm` (default local: `solar2026`) |

## Deploy (Git + Vercel)

Repositório: https://github.com/paratysolar/simulador-solar  
Projeto Vercel: **simulador-solar** no time **INTELBRAS SOLAR**

Push na branch `main` dispara deploy automático.

```bash
git add -A
git commit -m "Atualização"
git push origin main
```

## Embed (iframe)

```html
<iframe
  src="https://simulador-solar-zeta.vercel.app/index.html"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none;border-radius:12px;min-height:800px"
  title="Simulador Solar">
</iframe>
```

## Desenvolvimento local

```bash
npm install
# opcional:
# export BLOB_READ_WRITE_TOKEN=...
# export CRM_PASSWORD=solar2026
npm run dev
```

- Simulador: http://localhost:3000  
- CRM: http://localhost:3000/crm  

## Estrutura de pastas

```
app/
  api/leads/route.js   # POST grava lead | GET lista (auth)
  crm/page.js          # Dashboard CRM
  layout.js / page.js  # Redirect para /index.html
public/
  index.html           # Loader gzip do simulador completo
  sim.js               # Cálculos + CEP + capturarLead
  sim.css              # Estilos
  crm.html             # CRM estático alternativo
```
