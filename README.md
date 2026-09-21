# Simulador Solar + CRM + WhatsApp (Paraty Solar)

Simulador de energia solar completo (On-Grid, Off-Grid, Hibrido, ROI) com captura de leads e **CRM embutido com integracao WhatsApp Business Cloud API**.

## Stack

- **Next.js 14** (App Router)
- **Vercel Blob** -> banco de dados (leads + config WhatsApp + conversas)
- **WhatsApp Cloud API** -> mensagens de servico gratuitas (janela 24h)
- Frontend estatico do simulador em `public/`

## Banco de dados

Ja criado e em uso: **Vercel Blob** (store conectado ao projeto).

| Dado | Path no Blob |
|------|----------------|
| Leads | `leads/{mode}/{id}.json` |
| Config WhatsApp | `config/whatsapp.json` |
| Mensagens | `whatsapp/messages/{phone}/...` |

Quando o volume crescer, migraremos para **Vercel Postgres** sem mudar a UI do CRM.

## CRM (`/crm`)

**Senha:** definida **apenas** na variável de ambiente `CRM_PASSWORD` no Vercel.  
Não existe senha padrão no código. Defina uma senha forte em:
Vercel → Project → Settings → Environment Variables → `CRM_PASSWORD`.

### Abas

1. **Leads** — lista, filtros, detalhe JSON
2. **WhatsApp** — inbox de conversas + resposta (gratuita na janela de 24h)
3. **Configuracoes** — conectar Meta/WhatsApp, webhook, status

### Funcionalidades gratuitas WhatsApp (volume inicial)

- Receber mensagens (sempre gratis)
- Responder dentro da janela de 24h (service messages)
- Webhook em tempo real
- Ate ~1.000 mensagens de servico/mes por numero (franquia Meta a partir de out/2026)

Marketing templates e disparos frios sao pagos — nao usamos no inicio.

## Como conectar o WhatsApp (parceiro Meta)

1. Crie um App em https://developers.facebook.com (tipo Business).
2. Adicione o produto **WhatsApp -> Cloud API**.
3. Gere um **token permanente** (System User) ou use o de teste.
4. Copie **Phone Number ID** e **WABA ID**.
5. No CRM -> **Configuracoes** -> cole os dados e salve.
6. Configure o **Webhook**:
