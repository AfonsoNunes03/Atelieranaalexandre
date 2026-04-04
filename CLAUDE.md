# CLAUDE.md
> Última atualização: 2026-04-04

Este ficheiro é a memória persistente do projeto. Lê-o completamente no início de cada sessão.

---

## O que é este projeto

**Atelier Ana Alexandre** — loja de arte online. Vite + React SPA (não Next.js), deployada na Vercel (em transição para Hostinger).
Artista gere obras, vê mensagens, confirma vendas. Clientes vêem galeria e compram.

**Stack**: React 18 + TypeScript + Vite · React Router v7 · Supabase (DB + Auth + Storage + Edge Functions) · Stripe · Resend (emails) · Tailwind CSS · motion (animações v12) · Recharts (Dashboards)

**Repositório**: `https://github.com/AfonsoNunes03/Atelieranaalexandre`
**Supabase Project ID**: `vqunmqtozykwqtmyfjyi`

---

## Comandos

```bash
npm run dev      # servidor Vite em desenvolvimento
npm run build    # build de produção (output: dist/)

# Após alterar schema da BD:
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts

# Deploy Edge Functions:
npx supabase functions deploy --all
```

---

## Arquitetura

### Routing & Auth

Ficheiro: `src/app/routes.tsx` · `vercel.json` (Vercel) ou `.htaccess` (Hostinger) para SPA.
-   **Admin**: Rota `/admin` protegida por email (`VITE_ADMIN_EMAIL`).
-   **Checkout**: Rota `/checkout` requer login do cliente (`RequireAuth`).

### Base de Dados & Storage

Acesso centralizado em `src/lib/db.ts`. 
-   **Tabelas**: `obras`, `contactos`, `newsletter`, `config_site`, `vendas`.
-   **Storage**: Bucket `obras` no Supabase para imagens.

### Edge Functions (Supabase)

-   `create-checkout-session`: Sessões Stripe.
-   `stripe-webhook`: Processa pagamentos e marca obras como vendidas.
-   `send-email`: Notificações via Resend.

---

## Regras de Desenvolvimento

1.  **Acesso à BD**: SEMPRE via `src/lib/db.ts` — nunca `supabase.from()` direto nos componentes.
2.  **Autenticação**: SEMPRE via `src/lib/auth.ts`.
3.  **Animações**: Usar biblioteca `motion`. Importar de `motion/react`. **Não usar `framer-motion`**.
4.  **Carrinho**: `src/lib/cart.tsx` — `useCart()`. **Persistente no localStorage**.
5.  **Design System**: Minimalista, luxo, tons `GOLD` (#C9A96E) e `CHARCOAL` (#1A1A1A).
6.  **Caminho db.ts**: A partir de componentes, usar `../../lib/db`.
7.  **Checklist**: Fonte de verdade em `prompt/checklist.md`.

---

## Estado do Projeto

### ✅ Funcionalidades Principais
- Galeria dinâmica com obras reais do Supabase.
- Admin Dashboard Premium com gráficos (Recharts) e estatísticas reais.
- Fluxo completo de compra: Carrinho -> Checkout -> Stripe -> Webhook.
- Autenticação de Admin e Clientes funcional.
- Gestão de stock automática após pagamento.
- Assets de luxo (Hero, Gallery Wall, Logo) e SEO configurado.

### ❌ Próximos Passos (ver checklist.md)
- Lançamento na Hostinger (configurar `.htaccess`).
- Melhorias P2/P3: i18n, Lazy loading de imagens, Error Boundaries.
e componentes**: `../../lib/db`.
7. **Checklist em `prompt/checklist.md`** — fonte de verdade para o que falta. Atualizar quando concluído.
