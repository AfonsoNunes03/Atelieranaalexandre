# Ana Alexandre Atelier — Checklist
> Última atualização: 2026-04-02 | Stack: React/Vite + Supabase + Stripe + Vercel
> Auditoria final v3: ficheiros lidos linha a linha. Discrepâncias críticas corrigidas.
> Descobertas v3: react-hot-toast crash (VendasSection), schema_secure.sql perigoso, ficheiros obsoletos na raiz, imagens duplicadas em public/.

---

## ESTADO REAL DO CÓDIGO — Antes de tocar em qualquer coisa

| Ficheiro | Estado real encontrado |
|---|---|
| `routes.ts` | Tem 10 rotas. Faltam: `/register`, `/checkout`, `/termos`, `/privacidade`, `/reclamacoes`, `/sucesso`, `/carrinho` |
| `LoginPage.tsx:525` | Link aponta para `/register` (não `/registar`) |
| `LoginPage.tsx:101` | `handleSubmit` usa `setTimeout` — não chama `signIn()` |
| `RegisterPage.tsx:138` | `handleSubmit` usa `setTimeout` — não chama `signUp()` |
| `ContactosPage.tsx:220` | `handleSubmit` usa `setTimeout` — não chama `enviarContacto()`. **Sem import de db.ts** |
| `Layout.tsx:762` | `handleNewsletter` é mock — não chama `subscribeNewsletter()`. **Sem import de db.ts** |
| `VendasSection.tsx:19` | **`import toast from "react-hot-toast"` — biblioteca NÃO instalada → crash imediato ao abrir tab Vendas** |
| `VendasSection.tsx:3` | Já usa `motion/react` ✓ — bug de framer-motion já não existe (item removido) |
| `VendasSection.tsx:2` | Importa `supabase` diretamente — não usa `db.ts` |
| `database.types.ts` | **Sem tipo `vendas`** — a tabela existe na BD mas não está tipada |
| `db.ts:180` | `createVenda(venda: any)` — usa `any`, sem tipo |
| `AdminDashboard.tsx` | Arrays `STATS`, `ORDERS`, `CLIENTES`, `OBRAS_INIT`, `NEWSLETTER_SUBS` hardcoded |
| `ProtectedRoute.tsx:5` | `ADMIN_EMAIL` com fallback hardcoded `"atelier.anaalexandre@gmail.com"` |
| `AdminProtected.tsx` | Existe e envolve `ProtectedRoute` — nunca ligado à rota `/admin` |
| `vercel.json` | Tem 4 headers. **Sem CSP** |
| `package.json` | Tem `"motion": "12.23.24"`. Sem `framer-motion`. `motion/react` funciona corretamente |
| `package.json` | Tem `"react-router"` E `"react-router-dom"` instalados — redundância; só usar `react-router-dom` |
| Páginas legais | `TermosPage`, `PrivacidadePage`, `ReclamacoesPage`, `SucessoPage`, `CarrinhoPage` — **ficheiros existem, sem rota** |
| `supabase/schema_secure.sql` | **⚠️ PERIGOSO — hardcodes email admin em SQL RLS. NÃO EXECUTAR. Apagar.** |
| `supabase/schema_dia1.sql` | Migração de sessão prévia — SQL já incorporado nos passos F1/F2. Apagar após executar F1/F2. |
| `fix-imports.ps1` (raiz) | Script PowerShell obsoleto para corrigir imports antigos — apagar |
| `nul` (raiz) | Ficheiro lixo criado por erro de Windows — apagar |
| `SuccessPage.tsx` | Duplicado de `SucessoPage.tsx` — implementação incompleta. Apagar. |
| `public/novo_01.jpg` + `public/novo_01.png` (×5 pares) | Pares jpg+png duplicados — apagar os `.png` redundantes |
| `public/assets/*.png` (nomes de hash) | São assets do Figma mapeados em `vite.config.ts` — **NÃO apagar** |

---

## FLUXO DE AUTENTICAÇÃO — Como deve funcionar

```
Visitante → vê tudo livremente
  └── clica Comprar → RequireAuth deteta sem sessão
        └── redireciona /login?redirect=/checkout
              ├── Tem conta → signIn() → volta para /checkout
              └── Não tem conta → link /register → signUp() → email de confirmação → /login
Admin → /login → signIn() → email = VITE_ADMIN_EMAIL → /admin
```

---

## PRIORIDADE 1 — Obrigatório para ir live

> Executar EXATAMENTE nesta ordem. Dependências marcadas.

---

### GRUPO A — Arquitetura de Auth
> Ordem obrigatória: A1 → A2 → A3 → A4.
> A2 não pode ser feito sem A1. A3 não pode ser feito sem A2.

**A1. Criar `RequireAuth` — novo ficheiro `src/app/components/RequireAuth.tsx`**
- [ ] Verificar sessão com `getSession()` importado de `../../lib/auth`
- [ ] Sem sessão → `<Navigate to={"/login?redirect=" + location.pathname} replace />`
- [ ] Com sessão → renderizar `{children}`
- [ ] Usar `useState("loading")` + `useEffect` com `getSession()`, igual ao padrão do `ProtectedRoute.tsx`
- [ ] **Não tocar em `ProtectedRoute.tsx`** — esse fica só para admin

**A2. Remover email hardcoded — `src/app/components/ProtectedRoute.tsx:5`**
- [ ] Linha 5 atual: `const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "atelier.anaalexandre@gmail.com";`
- [ ] Substituir por: `const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "";`
- [ ] Adicionar ao `.env.local.example`: `VITE_ADMIN_EMAIL=`
- [ ] **Só fazer depois de A1** — `ProtectedRoute` continua a funcionar, só sem o email em claro

**A3. Ligar `/admin` ao `AdminProtected` — `src/app/routes.ts:15`**
- [ ] Linha atual: `{ path: "/admin", Component: AdminDashboard }`
- [ ] Substituir por: `{ path: "/admin", Component: AdminProtected }`
- [ ] Adicionar import: `import { AdminProtected } from "./components/AdminProtected";`
- [ ] Remover import de `AdminDashboard` do routes.ts (já está importado dentro de `AdminProtected`)
- [ ] **Só fazer depois de A2**

**A4. Proteger `/checkout` com `RequireAuth` — `src/app/routes.ts`**
- [ ] Feito em conjunto com **C1** (único edit ao routes.ts)
- [ ] **Só fazer depois de A1**

---

### GRUPO B — Formulários de Auth
> Independentes. Não tocam nos mesmos ficheiros. Podem ser feitos em qualquer ordem.

**B1. LoginPage — substituir mock por auth real — `src/app/components/LoginPage.tsx`**
- [ ] Adicionar import no topo: `import { signIn } from "../../lib/auth";`
- [ ] Linha 2 atual tem só `Link` de react-router-dom. **Substituir** por:
  `import { Link, useNavigate, useLocation } from "react-router-dom";`
- [ ] Substituir `handleSubmit` (linhas 101-108):
  ```typescript
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(redirect, { replace: true });
    } catch {
      setError("Email ou palavra-passe incorretos.");
      setSubmitting(false);
    }
  };
  ```
- [ ] Adicionar estado `error` se não existir: `const [error, setError] = useState<string | null>(null);`
- [ ] Mostrar `{error && <p style={{color:"red"}}>{error}</p>}` no JSX, antes do botão
- [ ] Link na linha 525 aponta para `/register` — **manter assim** (rota será `/register` no C1)

**B2. RegisterPage — substituir mock por auth real — `src/app/components/RegisterPage.tsx`**
- [ ] Adicionar import no topo: `import { signUp } from "../../lib/auth";`
- [ ] Substituir `handleSubmit` (linhas 138-146):
  ```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) return;
    setSubmitting(true);
    try {
      await signUp(values.email, values.password, values.name);
      setSubmitted(true); // mostra ecrã "Verifica o teu email"
    } catch {
      setError("Erro ao criar conta. Tenta novamente.");
      setSubmitting(false);
    }
  };
  ```
- [ ] Adicionar estado `error` se não existir: `const [error, setError] = useState<string | null>(null);`
- [ ] Mostrar `{error && <p style={{color:"red"}}>{error}</p>}` no JSX
- [ ] O ecrã `submitted` já existe (linhas 256-303) — só alterar o texto para "Verifica o teu email para confirmar a conta."

---

### GRUPO C — Rotas (único edit ao routes.ts)
> C1 é um único commit. Todas as rotas novas num só ficheiro, uma só vez.
> Fazer A1 primeiro (RequireAuth tem de existir para o checkout).
> ⚠️ CRÍTICO: `routes.ts` é `.ts` (não `.tsx`) — JSX inline não compila. Ver C0.

**C0. Renomear `routes.ts` → `routes.tsx` — ANTES de C1**
- [ ] Renomear o ficheiro: `src/app/routes.ts` → `src/app/routes.tsx`
- [ ] `App.tsx` importa `from "./routes"` — TypeScript resolve `.tsx` automaticamente, **nenhuma alteração necessária em App.tsx**
- [ ] Esta renomeação é obrigatória: o passo C1 adiciona JSX (`<RequireAuth>...`) e `.ts` não suporta JSX

**C1. Todas as rotas em falta — `src/app/routes.tsx` (editar uma única vez, após C0)**
- [ ] Adicionar imports no topo (verificar quais já existem):
  ```typescript
  import { RegisterPage } from "./components/RegisterPage";
  import { TermosPage } from "./components/TermosPage";
  import { PrivacidadePage } from "./components/PrivacidadePage";
  import { ReclamacoesPage } from "./components/ReclamacoesPage";
  import { SucessoPage } from "./components/SucessoPage";
  import { CarrinhoPage } from "./components/CarrinhoPage";
  import { CheckoutPage } from "./components/CheckoutPage";
  import { RequireAuth } from "./components/RequireAuth";
  ```
- [ ] Adicionar rota `/register` fora do Layout (junto a `/login`):
  ```typescript
  { path: "/register", Component: RegisterPage },
  ```
  **Nota:** usar `/register` (não `/registar`) — é o caminho que `LoginPage.tsx:525` já usa
- [ ] Adicionar rotas dentro do `children` do Layout:
  ```typescript
  { path: "termos", Component: TermosPage },
  { path: "privacidade", Component: PrivacidadePage },
  { path: "reclamacoes", Component: ReclamacoesPage },
  { path: "sucesso", Component: SucessoPage },
  { path: "carrinho", Component: CarrinhoPage },
  {
    path: "checkout",
    element: (
      <RequireAuth>
        <CheckoutPage />
      </RequireAuth>
    ),
  },
  ```
- [ ] Verificar que `{ path: "*", Component: HomePage }` continua como última entrada no `children`
- [ ] Verificar links do footer em `Layout.tsx` apontam para `/termos`, `/privacidade`, `/reclamacoes`

---

### GRUPO D — Formulários reais
> D1 e D2 são independentes. Não tocam nos mesmos ficheiros.

**D1. Contactos — `src/app/components/ContactosPage.tsx`**
- [ ] Adicionar import no topo: `import { enviarContacto } from "../../lib/db";`
- [ ] Adicionar estado de erro: `const [formError, setFormError] = useState<string | null>(null);`
- [ ] Substituir `handleSubmit` (linhas 220-224):
  ```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await enviarContacto({
        nome,
        email,
        telefone: telefone || null,
        mensagem,
        assunto: selectedIntention ?? "",
      });
      setFormSubmitted(true);
    } catch {
      setFormError("Erro ao enviar mensagem. Por favor tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  };
  ```
- [ ] Mostrar `{formError && <p>{formError}</p>}` no JSX antes do botão de submit

**D2. Newsletter — `src/app/components/Layout.tsx`**
- [ ] Adicionar import no topo (Layout não tem nenhum import de db.ts — verificado):
  `import { subscribeNewsletter } from "../../lib/db";`
  (Layout está em `src/app/components/` → db está em `src/lib/` → caminho: `../../lib/db`)
- [ ] Adicionar estado de erro: `const [newsletterError, setNewsletterError] = useState<string | null>(null);`
- [ ] Substituir `handleNewsletter` (linhas 762-765):
  ```typescript
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsletterSent(true);
    } catch {
      setNewsletterError("Erro ao subscrever. Tenta novamente.");
    }
  };
  ```
- [ ] Mostrar `{newsletterError && <p>{newsletterError}</p>}` no JSX perto do formulário

---

### GRUPO E — Segurança de Deploy
> Independentes entre si. Fazer antes do primeiro push para produção.

**E1. Verificar `.env.local` no histórico git**
- [ ] Correr: `git log --all --full-history -- .env.local`
- [ ] Se aparecer commits: rodar chaves no painel Supabase e Stripe imediatamente
- [ ] Confirmar `.gitignore` tem linha `.env.local`

**E2. CORS nas Edge Functions**
- [ ] `supabase/functions/create-checkout-session/index.ts` — substituir `"*"`:
  ```typescript
  const ALLOWED_ORIGINS = ["https://atelieranaalexandre.pt", "http://localhost:5173"];
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  // usar corsOrigin em vez de "*" no header
  ```
- [ ] Repetir para `supabase/functions/send-email/index.ts`
- [ ] Repetir para `supabase/functions/notify-contacto/index.ts`

**E3. Newsletter RLS — Supabase SQL Editor**
- [ ] Executar (fix à policy que permite qualquer pessoa desativar subscrições alheias):
  ```sql
  DROP POLICY IF EXISTS "newsletter_public_update" ON newsletter;
  CREATE POLICY "newsletter_auth_update" ON newsletter
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

---

### GRUPO F — Schema da Base de Dados
> Ordem obrigatória: F1 → F2 → F3. F3 (webhook) depende de F1+F2.

**F1. Corrigir schema `vendas` — Supabase SQL Editor**
- [ ] Executar (idempotente — pode correr várias vezes sem dano):
  ```sql
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'vendas' AND column_name = 'stripe_id'
    ) THEN
      ALTER TABLE vendas RENAME COLUMN stripe_id TO stripe_session_id;
    END IF;
  END $$;
  ALTER TABLE vendas
    ADD COLUMN IF NOT EXISTS metodo_pagamento text
      DEFAULT 'transferencia'
      CHECK (metodo_pagamento IN ('stripe', 'transferencia')),
    ADD COLUMN IF NOT EXISTS referencia text;
  ```
- [ ] Após executar, regenerar tipos TypeScript:
  ```bash
  npx supabase gen types typescript --project-id <SEU_PROJECT_ID> \
    > src/lib/database.types.ts
  ```
- [ ] Confirmar que `database.types.ts` passa a ter a tabela `vendas` tipada
- [ ] Em `src/lib/db.ts`: substituir `createVenda(venda: any)` pelo tipo gerado:
  ```typescript
  type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];
  export async function createVenda(venda: VendaInsert): Promise<string | null> { ... }
  ```

**F2. Adicionar RLS UPDATE na tabela `vendas` — Supabase SQL Editor**
- [ ] **Só depois de F1**
  ```sql
  DROP POLICY IF EXISTS "vendas_auth_update" ON vendas;
  CREATE POLICY "vendas_auth_update" ON vendas
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

**F3. Corrigir webhook Stripe — `supabase/functions/stripe-webhook/index.ts`**
- [ ] **Só depois de F1+F2**
- [ ] Substituir referência à coluna de `stripe_id` por `stripe_session_id` (nome correto após F1)
- [ ] Após marcar venda como `pago`, marcar obras como vendidas:
  ```typescript
  const itemIds: string[] = (vendaData?.items ?? []).map((i: { id: string }) => i.id);
  if (itemIds.length > 0) {
    await supabase.from("obras").update({ estado: "vendido" }).in("id", itemIds);
  }
  ```
- [ ] Adicionar handler para `checkout.session.expired`:
  ```typescript
  case "checkout.session.expired": {
    const session = event.data.object;
    const { data: venda } = await supabase
      .from("vendas")
      .select("id, items")
      .eq("stripe_session_id", session.id)
      .single();
    if (venda) {
      const ids = (venda.items ?? []).map((i: { id: string }) => i.id);
      if (ids.length > 0) {
        await supabase.from("obras").update({ estado: "disponivel" }).in("id", ids);
      }
      await supabase.from("vendas").update({ estado: "cancelado" }).eq("id", venda.id);
    }
    break;
  }
  ```
- [ ] Deploy: `npx supabase functions deploy stripe-webhook`

---

### GRUPO G — Bugs e Conteúdo
> Independentes entre si. Sem dependências de outros grupos.

**G0. ⚠️ CRASH — Substituir `react-hot-toast` em `src/app/components/admin/sections/VendasSection.tsx`**
- [ ] **Problema**: linha 19 importa `import toast from "react-hot-toast"` mas `react-hot-toast` **não está em package.json** → crash ao abrir tab Vendas no admin
- [ ] O projeto usa `src/lib/toast.ts` como sistema de toasts próprio OU shadcn `sonner`
- [ ] Verificar qual sistema de toast está em uso nas outras páginas admin (`ObrasSection`, `DashboardHome`)
- [ ] Substituir a linha de import por:
  ```typescript
  import { useToast } from "@/hooks/use-toast"; // se shadcn sonner
  // OU
  import { showToast } from "../../lib/toast"; // se toast custom
  ```
- [ ] Substituir todas as chamadas `toast("...")` pelo equivalente do sistema escolhido
- [ ] Confirmar `npm run build` sem erros após a alteração

**G1. IBAN hardcoded nos emails — `supabase/functions/send-email/index.ts`**
- [ ] Localizar linha com `PT50 0000...` e substituir por:
  ```typescript
  const iban = Deno.env.get("IBAN_ATELIER") ?? "Contactar atelier para dados bancários";
  ```
- [ ] Configurar secret: `npx supabase secrets set IBAN_ATELIER=PT50...`
- [ ] Deploy: `npx supabase functions deploy send-email`

**G2. Checkout sem validação de stock — `src/app/components/CheckoutPage.tsx`**
- [ ] `CheckoutPage` NÃO importa supabase diretamente (confirmado) — adicionar import:
  `import { supabase } from "../../lib/supabase";`
- [ ] Estado de loading confirmado: `setSending` (linha 26: `const [sending, setSending] = useState(false)`)
- [ ] No início de `handleSubmit`, **antes** de `createVenda()`, inserir:
  ```typescript
  const { data: obrasAtuais } = await supabase
    .from("obras")
    .select("id, titulo, estado")
    .in("id", items.map(i => i.id));
  const indisponiveis = (obrasAtuais ?? []).filter(o => o.estado !== "disponivel");
  if (indisponiveis.length > 0) {
    setError(`"${indisponiveis[0].titulo}" já não está disponível. Atualiza o carrinho.`);
    setSending(false);
    return;
  }
  ```

**G3. SucessoPage texto errado — `src/app/components/SucessoPage.tsx`**
- [ ] `useSearchParams` já está importado (linha 2) ✓
- [ ] `const [searchParams] = useSearchParams()` já existe (linha 12) ✓
- [ ] **Apenas adicionar** a lógica condicional no JSX (o hook já está lá):
  ```typescript
  const isPagamento = searchParams.has("session_id");
  // título: isPagamento ? "Pagamento confirmado!" : "Pedido recebido!"
  // sub: isPagamento
  //   ? "Receberás o recibo por email em breve."
  //   : "Vais receber os dados de transferência por email."
  ```
  Não duplicar nenhum import — só alterar o texto renderizado

**G4. Ficheiros públicos em falta — criar em `public/`**
- [ ] `public/favicon.png` — ícone do browser (referenciado em `index.html`)
- [ ] `public/apple-touch-icon.png` — ícone iOS (referenciado em `index.html`)
- [ ] `public/og-image.jpg` — imagem das partilhas sociais (referenciado nos meta tags)
- [ ] `public/icons/icon-192.png` — ícone PWA (referenciado em `manifest.json`)
- [ ] `public/icons/icon-512.png` — ícone PWA (referenciado em `manifest.json`)

---

### GRUPO H — Limpeza final
> Só fazer depois de tudo testado e funcional.

- [ ] **H1.** Apagar da raiz: `diagnose.mjs`, `check_db.js`, `nul`, `fix-imports.ps1`
- [ ] **H2.** Apagar `src/app/components/SuccessPage.tsx` — duplicado incompleto; `SucessoPage.tsx` é o correto (já nas rotas)
- [ ] **H3.** Atualizar `.env.local.example` com: `VITE_ADMIN_EMAIL=`, `VITE_RESEND_API_KEY=re_...`
  Nota: `STRIPE_SECRET_KEY` vai para Supabase secrets — nunca exposto no frontend
- [ ] **H4.** Apagar `supabase/schema_secure.sql` — **perigoso**: hardcodes `atelier.anaalexandre@gmail.com` em políticas RLS SQL. Se executado, bloqueia toda a escrita na BD a um email literal. O ficheiro `schema_secure.sql` não deve existir no repo.
- [ ] **H5.** Apagar `supabase/schema_dia1.sql` — **só após F1+F2 terem sido executados no Supabase**. O SQL deste ficheiro já está incorporado nos passos F1 e F2 do checklist.
- [ ] **H6.** Imagens duplicadas em `public/` — apagar os `.png` redundantes (manter `.jpg`):
  `public/novo_01.png`, `public/novo_02.png`, `public/novo_03.png`, `public/novo_04.png`, `public/novo_05.png`
  ⚠️ **NÃO apagar** `public/assets/*.png` — são assets Figma mapeados em `vite.config.ts`
- [ ] **H7.** Confirmar que `package.json` não tem `"react-router"` e `"react-router-dom"` simultaneamente — remover `"react-router"` se `react-router-dom` estiver a funcionar

---

## PRIORIDADE 2 — Corrigir logo após o lançamento

### Admin com dados reais

**Criar funções em `src/lib/db.ts`** (fazer depois de F1 — tipos têm de estar gerados):
- [ ] Adicionar `getVendasAdmin()`:
  ```typescript
  export async function getVendasAdmin() {
    const { data, error } = await supabase
      .from("vendas").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  ```
- [ ] Adicionar `updateVendaEstado()`:
  ```typescript
  export async function updateVendaEstado(
    id: string,
    estado: "pendente" | "pago" | "enviado" | "cancelado"
  ) {
    const { error } = await supabase.from("vendas").update({ estado }).eq("id", id);
    if (error) throw error;
  }
  ```

**Refatorar `VendasSection.tsx`** (depois de criar as funções acima):
- [ ] Substituir import `supabase` por `getVendasAdmin` e `updateVendaEstado` de `db.ts`
- [ ] Remover interface `Venda` local — usar o tipo gerado de `database.types.ts`
- [ ] Adicionar coluna "Método" (💳 Stripe / 🏦 Transferência)
- [ ] Adicionar botão "Confirmar Pagamento" para transferências

**AdminDashboard — substituir mock data**:
- [ ] Remover arrays `STATS`, `ORDERS`, `ALL_ORDERS`, `CLIENTES`, `OBRAS_INIT`, `NEWSLETTER_SUBS`
- [ ] `DashboardHome` já usa `getStatsAdmin()` — garantir que é o único source de dados
- [ ] Obras → `getObras()` | Newsletter → `getNewsletterAdmin()` | Vendas → `getVendasAdmin()`
- [ ] Remover tab "Membros" do `AdminSidebar` (sem secção correspondente)

### Sistema de Toasts — Unificar (após G0)

O projeto tem 3 implementações em conflito:
- `src/lib/toast.ts` — toast customizado próprio
- `src/components/ui/sonner.tsx` — shadcn Sonner
- `react-hot-toast` — referenciado em VendasSection mas **não instalado**

- [ ] Escolher UM sistema (recomendado: shadcn Sonner — já instalado)
- [ ] Substituir todas as chamadas de toast em todo o projeto pelo sistema escolhido
- [ ] Apagar os ficheiros dos sistemas não utilizados

---

### UX — Experiência incompleta

- [ ] **Página 404** — criar `src/app/components/NotFoundPage.tsx` e substituir `{ path: "*", Component: HomePage }` em `routes.ts`
- [ ] **Error Boundary** — criar `src/app/components/ErrorBoundary.tsx` e envolver `<RouterProvider>` em `App.tsx`
- [ ] **Toast ao adicionar ao carrinho** — `ObraPage.tsx`: após `addToCart()`, usar `ToastContainer` já existente
- [ ] **Link "Esqueci a palavra-passe"** — `LoginPage.tsx`: criar rota `/recuperar-password` com `supabase.auth.resetPasswordForEmail()`
- [ ] **Meta tags dinâmicas** — `ObraPage.tsx`: `document.title = obra.titulo + " — Ana Alexandre"` no `useEffect`
- [ ] **Carrinho persistente** — `src/lib/cart.tsx`: `localStorage.getItem/setItem("aa_cart", ...)` + verificar disponibilidade ao restaurar

### SEO & Performance

- [ ] `npm install @vercel/analytics @vercel/speed-insights` + adicionar em `src/main.tsx`
- [ ] `loading="lazy"` e `decoding="async"` em todas as `<img>` de obras (`GaleriaPage`, `ObraPage`)
- [ ] Code splitting: converter pages para `React.lazy()` em `routes.ts`
- [ ] Imagens grandes em `public/assets/` — converter para WebP

### Segurança adicional

- [ ] **Upload** — `src/lib/db.ts:uploadObraImage`: validar MIME type, extensão e tamanho ≤ 10 MB
- [ ] **CSP** — `vercel.json`: adicionar `Content-Security-Policy` (sem duplicar os 4 headers já existentes)
- [ ] **Consola** — `src/lib/db.ts:124,187,270`: logs detalhados só em `import.meta.env.DEV`
- [ ] **Edge Functions** — `create-checkout-session`: validar preços > 0 e email format; `send-email`: whitelist de tipos
- [ ] **Webhook idempotência** — `stripe-webhook`: verificar `stripe_event_id` antes de processar

---

## PRIORIDADE 3 — Melhorias graduais com o site no ar

- [ ] Routing por slug (`/galeria/:slug`) — `getObraBySlug()` já existe em `db.ts`
- [ ] Filtros na galeria — por técnica e estado
- [ ] Lightbox — zoom fullscreen na imagem
- [ ] Página "A minha conta" — histórico de encomendas
- [ ] Recuperação de palavra-passe — rota + `supabase.auth.resetPasswordForEmail()`
- [ ] IBAN editável pelo admin — via `config_site`
- [ ] Gráfico de vendas — Recharts já instalado
- [ ] Newsletter broadcast — envio para todos via Resend
- [ ] MB WAY — `payment_method_types: ["mb_way"]`
- [ ] IVA 23% — Stripe automatic tax
- [ ] Reembolsos — botão admin + Stripe refund API
- [ ] Newsletter unsubscribe — token único + `/unsubscribe?token=xxx`
- [ ] Vercel Analytics + Speed Insights
- [ ] PWA ícones — `public/icons/icon-192.png` e `icon-512.png`
- [ ] Abandonos de carrinho — email automático após 24h
- [ ] Certificado de autenticidade — PDF automático

---

## Comandos essenciais

```bash
# Dev
npm run dev

# Build — 0 erros antes de qualquer deploy
npm run build

# Regenerar tipos após alterar schema (obrigatório após F1)
npx supabase gen types typescript --project-id <SEU_PROJECT_ID> \
  > src/lib/database.types.ts

# Deploy edge functions
npx supabase functions deploy --all

# Secrets — configurar ANTES do lançamento
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set SITE_URL=https://atelieranaalexandre.pt
npx supabase secrets set NOTIFY_EMAIL=atelier.anaalexandre@gmail.com
npx supabase secrets set IBAN_ATELIER=PT50...

# Verificar .env.local no histórico git
git log --all --full-history -- .env.local

# Stripe webhook em desenvolvimento
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```
