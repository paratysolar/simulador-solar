# Simulador Solar Completo (Vercel + Blob)

Simulador de energia solar com 4 modos e captura de leads no **Vercel Blob**.

## Modos

| Modo | Descrição |
|------|-----------|
| **On-Grid** | Sistema conectado à rede (estilo Intelbras) |
| **Off-Grid** | Isolado com baterias e lista de cargas |
| **Híbrido** | Rede + backup |
| **ROI** | Análise de retorno do investimento |

## Stack

- Next.js 14 (App Router)
- API Route `POST /api/leads` → grava no **Vercel Blob**
- `GET /api/leads` → lista os últimos 100 leads
- Frontend estático em `public/index.html`
- CEP automático (ViaCEP) + checkbox de humano

## Deploy (Git + Vercel)

1. Repositório GitHub: `paratysolar/simulador-solar`
2. Projeto Vercel no time **INTELBRAS SOLAR**
3. Após o primeiro deploy, crie um **Blob Store** no dashboard Vercel:
   - Storage → Create → Blob
   - Conecte ao projeto `simulador-solar`
   - Isso injeta automaticamente `BLOB_READ_WRITE_TOKEN`

## Endpoints

```
POST /api/leads
Body: { mode, cep, cidade, ...campos do cálculo, ts }

GET  /api/leads
GET  /api/leads?mode=ongrid
```

## Desenvolvimento local

```bash
npm install
# opcional: export BLOB_READ_WRITE_TOKEN=...
npm run dev
```

Abra http://localhost:3000 (redireciona para o simulador).

## Embed

```html
<iframe
  src="https://SEU-DOMINIO.vercel.app/index.html"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none;border-radius:12px;min-height:800px">
</iframe>
```
