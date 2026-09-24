# Simulador Solar + CRM + WhatsApp (Paraty Solar)

Simulador de energia solar completo (On-Grid, Off-Grid, Hibrido, ROI) com captura de leads e **CRM embutido com integracao WhatsApp Business Cloud API**.

## Stack

- **Next.js 14** (App Router)
- **Postgres** (Neon / Vercel Postgres) via `DATABASE_URL`
- **WhatsApp Cloud API** -> mensagens de servico gratuitas (janela 24h)
- Frontend estatico do simulador em `public/`

## Banco de dados

**Postgres obrigatório** (Neon ou Vercel Postgres).

Defina `DATABASE_URL` nas variáveis de ambiente do Vercel.
O schema (`leads`, `proposals`, `crm_meta`, `whatsapp_messages`, `app_config`) é criado automaticamente no primeiro uso.

| Tabela | Uso |
|--------|-----|
| leads | Captura do simulador + CRM |
| proposals | Propostas geradas em /prop |
| crm_meta | Stages/tags do funil |
| whatsapp_messages | Inbox WA |

Blob **não** é mais usado para leads/propostas.

## Módulo Propostas (`/prop`)

Senha: variável `PROP_PASSWORD` (separada do CRM).
Gera propostas On-Grid, Off-Grid e Híbrido com lista de materiais e totais.

## CRM (`/crm`)

**Senha:** `CRM_PASSWORD` no Vercel.

## Variáveis

- `DATABASE_URL` (obrigatório)
- `CRM_PASSWORD`
- `PROP_PASSWORD` (já criada: prop2026paraty)
- `BLOB_READ_WRITE_TOKEN` (legado, não usado para leads)
