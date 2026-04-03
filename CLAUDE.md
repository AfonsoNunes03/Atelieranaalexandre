# CLAUDE.md
> Última atualização: 2026-04-02

Este ficheiro é a memória persistente do projeto. Lê-o completamente no início de cada sessão.

---

## O que é este projeto

**Atelier Ana Alexandre** — loja de arte online. Vite + React SPA (não Next.js), deployada na Vercel.
Artista pode gerir obras, ver mensagens, confirmar vendas. Clientes podem ver galeria e comprar.

**Stack**: React 18 + TypeScript + Vite · React Router v6 · Supabase (DB + Auth + Storage + Edge Functions) · Stripe · Resend (emails) · Tailwind CSS · motion/react (animações) · Recharts (gráficos, instalado mas não usado ainda)

---

## Comandos

```bash
npm run dev      # servidor Vite em desenvolvimento
npm run build    # build de produção (output: dist/)

# Após alterar o schema da BD — obrigatório para tipos TypeScript ficarem corretos:
npx supabase gen types typescript --project-id <ID> > src/lib/database.types.ts

# Deploy das Edge Functions:
npx supabase functions deploy --all

# Secrets Supabase (configurar antes de deploy):
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set SITE_URL=https://atelieranaalexandre.pt
npx supabase secrets set IBAN_ATELIER=PT50...
npx supabase secrets set NOTIFY_EMAIL=atelier.anaalexandre@gmail.com
```

Sem test runner. Sem ESLint.

---

## Ambiente

Copiar `.env.local.example` → `.env.local` e preencher:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_ADMIN_EMAIL=<email-do-admin>
```

`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são obrigatórios — `src/lib/supabase.ts` lança erro se faltarem.
`STRIPE_SECRET_KEY` vai para Supabase secrets, **nunca** para o frontend.

---

## Arquitetura

### Routing

Ficheiro: `src/app/routes.tsx`

`vercel.json` redireciona todas as rotas para `index.html` (client-side routing).

| Rota | Componente | Notas |
|---|---|---|
| `/login` | `LoginPage` | Fora do Layout |
| `/register` | `RegisterPage` | Fora do Layout |
| `/admin` | `AdminProtected` | lazy-load + `ProtectedRoute` |
| `/` | `HomePage` | Dentro do Layout |
| `/galeria` | `GaleriaPage` | |
| `/galeria/:id` | `ObraPage` | |
| `/sobre` | `SobrePage` | |
| `/mentoria` | `MentoriaPage` | |
| `/contactos` | `ContactosPage` | |
| `/premio` | `PremioPage` | |
| `/termos` | `TermosPage` | |
| `/privacidade` | `PrivacidadePage` | |
| `/reclamacoes` | `ReclamacoesPage` | |
| `/sucesso` | `SucessoPage` | |
| `/carrinho` | `CarrinhoPage` | |
| `/checkout` | `CheckoutPage` | Dentro de `<RequireAuth>` |
| `*` | `HomePage` | fallback |

### Auth

**Componentes:**
- `src/app/components/ProtectedRoute.tsx` — guard admin. Verifica email contra `VITE_ADMIN_EMAIL ?? ""`.
- `src/app/components/AdminProtected.tsx` — lazy-load + `ProtectedRoute`. Usado na rota `/admin`.
- `src/app/components/RequireAuth.tsx` — guard para utilizadores normais. Redireciona para `/login?redirect=...` se sem sessão.

**Funções em `src/lib/auth.ts`:**
- `signIn(email, password)`, `signUp(email, password, name)`, `signOut()`, `getSession()`, `onAuthStateChange(callback)`

**Fluxo:**
```
Visitante → vê site livremente
  └── tenta comprar → RequireAuth → /login?redirect=/checkout
        ├── tem conta → signIn() → volta ao checkout
        └── não tem → /register → signUp() → confirmar email → login
Admin → /login → signIn() → email=VITE_ADMIN_EMAIL → /admin
```

### Supabase — Base de Dados

Todo o acesso à BD passa por `src/lib/db.ts`. Cliente singleton em `src/lib/supabase.ts`, tipado contra `src/lib/database.types.ts`.

**Tabelas:** `obras`, `contactos`, `newsletter`, `config_site`, `vendas`

⚠️ **`database.types.ts` não tem a tabela `vendas` tipada** — regenerar após executar migração F1 (ver checklist).

**Funções exportadas em `src/lib/db.ts`:**
- Obras: `getObras`, `getObraById`, `getObraBySlug`, `getObrasDestaque`, `createObra`, `updateObra`, `deleteObra`, `updateObraStatus`
- Contactos: `enviarContacto`, `getContactosAdmin`, `marcarContactoLido`, `deleteContacto`
- Newsletter: `subscribeNewsletter`, `getNewsletterAdmin`, `toggleNewsletterStatus`
- Config: `getConfig`, `getConfigAll`, `updateConfigAdmin`
- Vendas: `createVenda` (usa `any` — corrigir após F1), `getVendasAdmin` e `updateVendaEstado` **ainda não existem**
- Storage: `uploadObraImage`, `deleteObraImage`
- Stats: `getStatsAdmin`

### Edge Functions (Supabase)

Todas em `supabase/functions/`. Código escrito, pendente deploy e configuração.

| Função | Propósito | Problema pendente |
|---|---|---|
| `create-checkout-session` | Cria sessão Stripe | ⚠️ CORS wildcard |
| `stripe-webhook` | Processa pagamentos Stripe | ⚠️ Coluna `stripe_id` → renomear para `stripe_session_id` (F1) |
| `send-email` | Emails via Resend | ⚠️ CORS wildcard + IBAN hardcoded |
| `notify-contacto` | Notificação de novo contacto | ⚠️ CORS wildcard |

### Admin Dashboard

`src/app/components/AdminDashboard.tsx` — sub-componentes em `src/app/components/admin/`.

⚠️ Dashboard ainda usa arrays mock hardcoded (`STATS`, `ORDERS`, `CLIENTES`, `OBRAS_INIT`, `NEWSLETTER_SUBS`). `DashboardHome.tsx` já usa `getStatsAdmin()` — é o padrão a seguir.

⚠️ `VendasSection.tsx` importa `supabase` diretamente — devia usar `getVendasAdmin()`/`updateVendaEstado()` de `db.ts`.

### Outros

- **i18n**: `src/app/i18n.tsx` — `LanguageProvider` + `useLanguage()`. PT (completo), EN/ES (parcial), FR (incompleto).
- **Assets**: `figma:asset/<hash>.png` mapeados em `vite.config.ts` para `public/assets/`. Para novos assets: actualizar `assetMap` em `vite.config.ts`. `@` → `src/`.
- **Carrinho**: `src/lib/cart.tsx` — `useCart()`. Sem persistência em `localStorage`.
- **Pagamentos**: `src/lib/stripe.ts` chama Edge Function `create-checkout-session`. Webhook não marca obras como `vendido` correctamente.
- **Toasts**: `src/lib/toast.ts` é o sistema em uso. Não usar `react-hot-toast` (não instalado).

---

## Estado do Projeto

> Plano de execução completo em `prompt/checklist.md`. Ler sempre antes de implementar.

### ✅ Funciona
- Galeria + CRUD obras no admin
- Design completo (Sepia/Gold/Creme, animações, responsive)
- i18n PT/EN/ES/FR
- SEO base, cookie consent, PWA manifest
- Routing completo (todas as rotas existem)
- Auth real: login, registo, guard admin, guard checkout

### ❌ Pendente (crítico para produção)
- **Schema BD**: coluna `stripe_id` → `stripe_session_id`; sem UPDATE policy em `vendas`; `database.types.ts` sem tabela `vendas`
- **Webhook**: não marca obras como vendidas após pagamento
- **IBAN hardcoded** nos emails de transferência
- **CORS wildcard** nas Edge Functions
- **Admin com dados mock** em vez de queries reais
- **Ficheiros públicos em falta**: `favicon.png`, `apple-touch-icon.png`, `og-image.jpg`, ícones PWA

---

## Regras de desenvolvimento

1. **Todo o acesso à BD passa por `src/lib/db.ts`** — nunca usar `supabase.from()` directamente em componentes.

2. **Imports de auth sempre de `src/lib/auth.ts`** — nunca chamar `supabase.auth.*` directamente nos componentes.

3. **Nunca editar `routes.tsx` mais do que uma vez** por sessão — todas as rotas novas num único commit.

4. **Após qualquer alteração ao schema SQL**, regenerar tipos:
   ```bash
   npx supabase gen types typescript --project-id <ID> > src/lib/database.types.ts
   ```

5. **Não usar `framer-motion`** — o projecto usa `motion/react` (pacote `"motion": "12.23.24"`).

6. **Caminho de `db.ts` a partir de componentes**: `../../lib/db` (componentes estão em `src/app/components/`).

7. **Checklist em `prompt/checklist.md`** — fonte de verdade para o que falta. Actualizar quando um item for concluído.
