# Ana Alexandre Atelier — Checklist de Lançamento
> Última atualização: 2026-04-01 | Stack: React/Vite + Supabase + Stripe + Vercel
> Objetivo: **pronto para receber vendas reais**

---

## ✅ CONCLUÍDO — Não tocar

### Core
- [x] Galeria dinâmica com obras do Supabase (CRUD completo)
- [x] Página de detalhe de obra
- [x] Carrinho com contexto React
- [x] Checkout com Stripe (cartão) e Transferência Bancária
- [x] Admin protegido por Supabase Auth
- [x] Admin: obras, conteúdo, mensagens, vendas
- [x] Design Sepia/Gold/Creme com micro-animações
- [x] Skeleton loaders e estados de loading
- [x] i18n PT/EN/ES/FR com switcher no header
- [x] SEO básico: meta tags, OG, Twitter Card, JSON-LD
- [x] Páginas legais: Termos, Privacidade, Livro de Reclamações
- [x] Cookie Consent banner (RGPD compliant)
- [x] Newsletter com Supabase
- [x] RLS em todas as tabelas (base)

### Automação
- [x] Edge Function `create-checkout-session` — Stripe real
- [x] Edge Function `stripe-webhook` — webhook Stripe
- [x] Edge Function `send-email` — emails via Resend
- [x] Edge Function `notify-contacto` — notificação de contacto
- [x] `src/lib/email.ts` — utilitário client-side seguro
- [x] Sitemap dinâmico em `/sitemap.xml` (Vercel function)
- [x] PWA: manifest.json + service worker

### Infraestrutura
- [x] `robots.txt` correto (`Disallow: /admin`, referência ao sitemap)
- [x] Headers de segurança no `vercel.json` (X-Frame-Options, XSS, etc.)
- [x] Cache imutável para assets estáticos

---

## 🔴 BLOQUEADORES — Não lançar sem isto

### 1. Bug que crasha o Admin
- [ ] **`VendasSection` importa `framer-motion`** — o projeto usa `motion/react`. Admin crasha ao abrir vendas.
  ```tsx
  // Ficheiro: src/app/components/admin/sections/VendasSection.tsx linha 3
  // Trocar:
  import { motion, AnimatePresence } from "framer-motion";
  // Por:
  import { motion, AnimatePresence } from "motion/react";
  ```

### 2. Schema inconsistente — webhook falha silenciosamente
- [ ] **`vendas.stripe_id` vs `stripe_session_id`** — o schema tem `stripe_id` mas o código e o webhook escrevem `stripe_session_id`. O webhook não guarda o ID da sessão Stripe.
  ```sql
  -- Executar no Supabase SQL Editor:
  ALTER TABLE vendas RENAME COLUMN stripe_id TO stripe_session_id;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS metodo_pagamento text
    DEFAULT 'transferencia'
    CHECK (metodo_pagamento IN ('stripe', 'transferencia'));
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS referencia text;
  ```
- [ ] **RLS `vendas` UPDATE em falta** — admin não consegue atualizar estado de vendas.
  ```sql
  CREATE POLICY "vendas_auth_update" ON vendas
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

### 3. Webhook não marca obras como vendidas
- [ ] **`stripe-webhook`** — após pagamento confirmado, as obras NÃO passam para `vendido`. Resultado: obra aparece como disponível depois de vendida.
  Adicionar em `supabase/functions/stripe-webhook/index.ts` após atualizar venda para 'pago':
  ```typescript
  const itemIds = vendaData?.items?.map((i: any) => i.id) ?? [];
  if (itemIds.length > 0) {
    await supabase.from("obras").update({ estado: "vendido" }).in("id", itemIds);
  }
  ```
- [ ] **`stripe-webhook`** — adicionar handler `checkout.session.expired` para reverter obras de `reservado` para `disponivel` e venda para `cancelado`.

### 4. Segurança — Registo público
- [ ] **`RegisterPage` acessível publicamente** — qualquer pessoa pode criar conta e aceder ao admin.
  Solução mais simples: remover a rota em `src/app/routes.ts`:
  ```typescript
  // Apagar esta linha:
  { path: "/register", Component: RegisterPage },
  ```
  O registo de admins faz-se diretamente no Supabase Dashboard.

### 5. Vulnerabilidade na Newsletter
- [ ] **`newsletter_public_update`** — qualquer pessoa pode desativar qualquer subscrição via API.
  ```sql
  DROP POLICY IF EXISTS "newsletter_public_update" ON newsletter;
  CREATE POLICY "newsletter_auth_update" ON newsletter
    FOR UPDATE USING (auth.role() = 'authenticated');
  ```

### 6. IBAN placeholder nos emails
- [ ] **`supabase/functions/send-email/index.ts`** — o IBAN nos emails de transferência é um placeholder `PT50 0000...`. Substituir por variável de ambiente:
  ```typescript
  const iban = Deno.env.get("IBAN_ATELIER") ?? "IBAN não configurado";
  ```
  E configurar o secret:
  ```bash
  npx supabase secrets set IBAN_ATELIER=PT50xxxx...
  ```

### 7. Validação de stock em falta
- [ ] **Checkout sem verificação de disponibilidade** — é possível comprar uma obra que já foi vendida (race condition ou carrinho antigo). Adicionar em `CheckoutPage.tsx` antes do `handleSubmit`:
  ```typescript
  // Verificar que todas as obras ainda estão 'disponivel'
  const { data: obrasAtuais } = await supabase
    .from("obras").select("id, estado").in("id", items.map(i => i.id));
  const vendidas = obrasAtuais?.filter(o => o.estado !== "disponivel") ?? [];
  if (vendidas.length > 0) {
    setError("Uma ou mais obras já não estão disponíveis.");
    return;
  }
  ```

### 8. SucessoPage com texto errado
- [ ] **`SucessoPage`** — mostra "Mensagem enviada com sucesso" para pagamentos. Corrigir para diferenciar contextos:
  - Com `?session_id=` no URL → "Pagamento confirmado! Vais receber o recibo por email."
  - Sem `session_id` → "Pedido recebido! Vais receber os dados de transferência por email."

---

## 🟡 IMPORTANTE — Fazer antes de promover o site

### Admin — Completar funcionalidades prometidas
- [ ] **`VendasSection`** — mostrar coluna "Método" (💳 Stripe / 🏦 Transferência) — dados existem, só falta mostrar.
- [ ] **`VendasSection`** — botão "Confirmar Pagamento" para vendas por transferência (muda estado pendente→pago, envia email ao cliente).
- [ ] **`ConteudoSection`** — IBAN editável pelo admin via `config_site` (chave `iban_atelier`).

### Galeria & UX
- [ ] **Routing por slug** — `ObraPage` usa UUID no URL. Mudar para `/galeria/:slug` (slug já existe na DB, `getObraBySlug()` já existe em `db.ts`).
- [ ] **Carrinho sem persistência** — perde-se ao fechar o browser. Guardar em `localStorage` em `src/lib/cart.tsx`.
- [ ] **Filtros na galeria** — por técnica e estado (disponível/vendido). Evita frustrações de clientes a tentar comprar obras já vendidas.

### Performance mínima
- [ ] **Code splitting por rota** — `React.lazy()` em todas as páginas de `routes.ts`. Reduz bundle inicial (crítico: `@mui/material` carrega tudo).
- [ ] **Lazy loading de imagens** — `loading="lazy"` em todas as `<img>` da galeria.

---

## 🟡 SEGURANÇA ADICIONAL (antes de produção)

- [ ] **`obras` write scope** — qualquer utilizador autenticado pode criar/editar obras, não só admins. Criar tabela `admin_users` ou usar service role nas edge functions.
- [ ] **`send-email` sem validação** — edge function aceita qualquer email como destinatário (risco de relay). Adicionar validação de formato e comparação com `customerEmail` da venda.
- [ ] **Validação Stripe return** — `SucessoPage` com `?session_id=` devia verificar o session server-side antes de mostrar sucesso.
- [ ] **Rate limiting** — sem proteção em `contactos` e `newsletter` contra spam. Supabase não limita inserções por defeito.

---

## 🟢 PÓS-LANÇAMENTO — Depois de estar a vender

### Pagamentos avançados
- [ ] **MB WAY via Stripe** — `payment_method_types: ["mb_way"]` na `create-checkout-session`.
- [ ] **Stripe Customer** — criar/associar `stripe_customer_id` para histórico do cliente.
- [ ] **Reembolsos** — botão no admin (VendasSection) que chama Stripe refund API.
- [ ] **Stripe automatic tax** — IVA 23% Portugal.
- [ ] **Referência única de venda** — ex: `ANA-2026-001` em `vendas.referencia`.

### Admin Premium
- [ ] **Gráfico de vendas** — receita por mês com Recharts (já instalado).
- [ ] **Drag-and-drop obras** — reordenação com react-dnd (já instalado).
- [ ] **Secção "Membros"** — lista de clientes com histórico de compras.
- [ ] **Secção "Settings"** — IBAN, redes sociais, exportar CSV, modo manutenção.
- [ ] **Newsletter broadcast** — envio de email a todos os subscritos via Resend.
- [ ] **Múltiplas imagens por obra** — galeria de 3-5 fotos.
- [ ] **Bulk actions** — marcar múltiplas obras em lote.

### SEO & Analytics
- [ ] **Vercel Analytics** — `npm install @vercel/analytics` + `<Analytics />` em `main.tsx`.
- [ ] **Vercel Speed Insights** — `npm install @vercel/speed-insights`.
- [ ] **JSON-LD `Product`** por obra — preço e disponibilidade para Google Shopping.
- [ ] **Imagens WebP** — `?width=800&format=webp` nas URLs do Supabase Storage.
- [ ] **Bundle analysis** — `rollup-plugin-visualizer` para identificar imports pesados.

### UX
- [ ] **Lightbox** — zoom fullscreen ao clicar na imagem da obra.
- [ ] **Página 404** — design coerente, link para galeria.
- [ ] **Páginas mencionadas no footer** — `/exposicoes`, `/workshops`, `/faq`.
- [ ] **Abandonos de carrinho** — email automático após 24h.
- [ ] **Lista de espera** — quando obra está vendida, formulário para entrar na lista.
- [ ] **Certificado de autenticidade** — PDF gerado automaticamente com a compra.

### PWA
- [ ] **Ícones PWA em falta** — criar `public/icons/icon-192.png` e `public/icons/icon-512.png`. Sem eles o "Instalar App" não funciona.

---

## 🧹 LIMPEZA — Ficheiros para remover

- [ ] `src/app/components/SuccessPage.tsx` — ficheiro duplicado/não usado. As rotas apontam para `SucessoPage.tsx`.
- [ ] `diagnose.mjs` na raiz — script de debug temporário.
- [ ] `check_db.js` na raiz — script de debug temporário.
- [ ] `nul` na raiz — ficheiro criado por erro do Windows (`> nul`).

---

## 📋 ESTADO ATUAL — Resumo Executivo

| Área | Estado | Bloqueador? |
|---|---|---|
| Admin (VendasSection) | ❌ Crasha — import errado | **SIM** |
| Webhook Stripe | ❌ Não marca obras como vendidas | **SIM** |
| Schema BD | ❌ stripe_id ≠ stripe_session_id | **SIM** |
| RLS newsletter | ❌ Abuso possível | **SIM** |
| Registo público | ❌ Qualquer pessoa cria admin | **SIM** |
| IBAN nos emails | ❌ Placeholder | **SIM** |
| Validação stock | ❌ Pode vender obra já vendida | **SIM** |
| SucessoPage | ⚠️ Texto genérico | Não, mas confuso |
| Carrinho persistência | ⚠️ Perde ao fechar browser | Não |
| Slug routing | ⚠️ URLs com UUID | Não |
| PWA ícones | ❌ public/icons/ não existe | Não (PWA não instala) |
| Ficheiros debug | ⚠️ diagnose.mjs, check_db.js, nul | Não |

---

## 🎯 ORDEM DE EXECUÇÃO (para lançar)

```
DIA 1 — Bugs e segurança (1-2h):
  1. Corrigir import framer-motion → motion/react (VendasSection)
  2. Remover rota /register
  3. SQL: renomear stripe_id, adicionar metodo_pagamento, corrigir RLS
  4. Remover ficheiros debug da raiz

DIA 2 — Pagamentos (2-3h):
  5. Stripe webhook: marcar obras como 'vendido' após pagamento
  6. Stripe webhook: handler checkout.session.expired
  7. IBAN: mover para variável de ambiente Supabase
  8. Checkout: validação de stock antes de pagar
  9. SucessoPage: texto contextual

DIA 3 — Polimento (1-2h):
  10. VendasSection: mostrar método de pagamento
  11. Carrinho: persistência em localStorage
  12. Imagens: loading="lazy" em toda a galeria
  13. Criar ícones PWA (192px e 512px)
```

---

---

## 🤖 PROMPTS DE TRABALHO — Copiar e colar para iniciar cada sessão

> Cada prompt instrui o agente a usar os plugins certos automaticamente.
> Ordem recomendada: DIA 1 → DIA 2 → DIA 3.
> **Antes de cada prompt:** abrir uma nova sessão Claude Code na pasta do projeto.

---

### PROMPT DIA 1 — Bugs Críticos & Segurança

```
Projeto: Ana Alexandre Atelier — React/Vite + Supabase + Stripe + Vercel.
Lê 'prompt/checklist.md' (secção 🔴 BLOQUEADORES) para contexto completo.

Usa o skill superpowers:systematic-debugging para diagnosticar cada problema
antes de o corrigir. Usa superpowers:test-driven-development em qualquer
código novo. Usa superpowers:verification-before-completion antes de marcar
cada tarefa como concluída.

Faz estas correções pela ordem indicada:

## 1. BUG CRÍTICO — Admin crasha (2 min)
Ficheiro: src/app/components/admin/sections/VendasSection.tsx linha 3
Trocar:  import { motion, AnimatePresence } from "framer-motion";
Por:     import { motion, AnimatePresence } from "motion/react";
Verificar: npm run build deve completar sem erros.

## 2. SEGURANÇA — Remover registo público (2 min)
Ficheiro: src/app/routes.ts
Remover a linha: { path: "/register", Component: RegisterPage },
Remover também o import: import { RegisterPage } from "./components/RegisterPage";
Verificar: navegar para /register no browser deve redirecionar para /

## 3. SQL — Corrigir schema (10 min)
Criar ficheiro: supabase/schema_dia1.sql com este conteúdo idempotente:

-- Corrigir coluna stripe_id → stripe_session_id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='vendas' AND column_name='stripe_id') THEN
    ALTER TABLE vendas RENAME COLUMN stripe_id TO stripe_session_id;
  END IF;
END $$;

-- Adicionar colunas em falta
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS metodo_pagamento text
  DEFAULT 'transferencia'
  CHECK (metodo_pagamento IN ('stripe', 'transferencia'));
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS referencia text;

-- RLS: admin pode atualizar vendas
DROP POLICY IF EXISTS "vendas_auth_update" ON vendas;
CREATE POLICY "vendas_auth_update" ON vendas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Corrigir newsletter: remover policy aberta
DROP POLICY IF EXISTS "newsletter_public_update" ON newsletter;
DROP POLICY IF EXISTS "newsletter_auth_update" ON newsletter;
CREATE POLICY "newsletter_auth_update" ON newsletter
  FOR UPDATE USING (auth.role() = 'authenticated');

Executar no Supabase SQL Editor (Dashboard > SQL Editor).
Verificar: tabela vendas tem coluna stripe_session_id e metodo_pagamento.

## 4. LIMPEZA — Remover ficheiros de debug (2 min)
Apagar da raiz: diagnose.mjs, check_db.js, nul
Verificar: git status não mostra estes ficheiros.

Usa superpowers:verification-before-completion no final.
Commit com mensagem: "fix: corrigir bugs críticos e segurança dia 1"
```

---

### PROMPT DIA 2 — Pagamentos & Fluxo de Compra

```
Projeto: Ana Alexandre Atelier — React/Vite + Supabase + Stripe + Vercel.
Lê 'prompt/checklist.md' (secção 🔴 BLOQUEADORES itens 6-8) para contexto.
O DIA 1 foi concluído — admin funciona, schema corrigido, /register removido.

Usa superpowers:systematic-debugging para analisar cada edge function antes
de a modificar. Usa superpowers:test-driven-development para código novo.
Para edge functions Supabase/Stripe, usa stripe:stripe-best-practices.
Usa superpowers:verification-before-completion antes de cada commit.

## 1. IBAN — Variável de ambiente (5 min)
Ficheiro: supabase/functions/send-email/index.ts
Localizar a linha com o IBAN hardcoded (ex: "PT50 0000...")
Substituir por: const iban = Deno.env.get("IBAN_ATELIER") ?? "Contactar atelier para dados bancários";
Configurar secret: npx supabase secrets set IBAN_ATELIER=<IBAN_REAL>
Verificar: fazer um pedido de transferência de teste e confirmar que o email tem o IBAN correto.

## 2. WEBHOOK — Marcar obras como vendidas (20 min)
Ficheiro: supabase/functions/stripe-webhook/index.ts
Localizar o handler do evento "checkout.session.completed".
Após atualizar venda.estado para 'pago', adicionar:
  - Buscar os item IDs da venda: const itemIds = vendaData?.items?.map(i => i.id) ?? [];
  - Atualizar: await supabase.from("obras").update({ estado: "vendido" }).in("id", itemIds);
  - Guardar stripe_session_id: await supabase.from("vendas").update({ stripe_session_id: session.id }).eq("id", vendaId);
Adicionar novo handler "checkout.session.expired":
  - Buscar venda por stripe_session_id
  - Atualizar obras para 'disponivel' e venda para 'cancelado'
Usar SUPABASE_SERVICE_ROLE_KEY para bypass de RLS no webhook.
Verificar com: stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
Deploy: npx supabase functions deploy stripe-webhook

## 3. CHECKOUT — Validação de stock (15 min)
Ficheiro: src/app/components/CheckoutPage.tsx
Na função handleSubmit, ANTES de createVenda(), adicionar:
  const { data: obrasAtuais } = await supabase
    .from("obras").select("id, titulo, estado").in("id", items.map(i => i.id));
  const indisponiveis = (obrasAtuais ?? []).filter(o => o.estado !== "disponivel");
  if (indisponiveis.length > 0) {
    setError(`"${indisponiveis[0].titulo}" já não está disponível. Atualiza o carrinho.`);
    setSending(false);
    return;
  }
Verificar: tentar comprar obra com estado='vendido' deve mostrar erro claro.

## 4. SUCESSO PAGE — Texto contextual (10 min)
Ficheiro: src/app/components/SucessoPage.tsx
Alterar o conteúdo consoante searchParams.get("session_id"):
  - Com session_id: título "Pagamento confirmado!" + "Receberás o recibo por email."
  - Sem session_id: título "Pedido recebido!" + "Vais receber os dados de transferência por email."
Manter o design Gold/Creme existente.
Verificar: testar ambos os URLs (/sucesso e /sucesso?session_id=test).

Usa superpowers:verification-before-completion no final de cada tarefa.
Deploy das edge functions: npx supabase functions deploy stripe-webhook
Commit: "feat: fluxo de pagamento completo e robusto"
```

---

### PROMPT DIA 3 — Polimento & UX

```
Projeto: Ana Alexandre Atelier — React/Vite + Supabase + Stripe + Vercel.
Lê 'prompt/checklist.md' (secção 🟡 IMPORTANTE) para contexto.
Os Dias 1 e 2 foram concluídos — pagamentos funcionam correctamente.

Usa superpowers:brainstorming se precisares de tomar decisões de UX/design.
Para componentes React, segue vercel:react-best-practices.
Para UI nova, usa frontend-design:frontend-design.
Usa superpowers:verification-before-completion antes de cada commit.

## 1. ADMIN — Método de pagamento em VendasSection (15 min)
Ficheiro: src/app/components/admin/sections/VendasSection.tsx
Adicionar coluna "Método" à tabela de vendas:
  - 💳 Cartão/Stripe (quando metodo_pagamento === 'stripe')
  - 🏦 Transferência (quando metodo_pagamento === 'transferencia' ou null)
Adicionar badge de estado colorido: pendente (amarelo), pago (verde), enviado (azul), cancelado (vermelho).
Manter o design admin existente (branco + gold).
Verificar: abrir admin > Vendas e confirmar que a coluna aparece.

## 2. CARRINHO — Persistência em localStorage (20 min)
Ficheiro: src/lib/cart.tsx
No useEffect de inicialização do contexto, carregar carrinho de localStorage:
  const saved = localStorage.getItem("aa_cart");
  if (saved) { try { setItems(JSON.parse(saved)); } catch {} }
Em cada alteração ao carrinho (addItem, removeItem, clearCart), persistir:
  localStorage.setItem("aa_cart", JSON.stringify(items));
Ao restaurar do localStorage, verificar via Supabase se as obras ainda estão disponíveis.
Verificar: adicionar obra ao carrinho, fechar browser, reabrir — carrinho deve persistir.

## 3. GALERIA — Lazy loading de imagens (10 min)
Ficheiros: src/app/components/GaleriaPage.tsx, ObraPage.tsx, CurvedCarousel.tsx
Em todas as tags <img> de obras, adicionar:
  loading="lazy"
  decoding="async"
  style={{ aspectRatio: "3/4" }}  (ou ratio adequado)
Verificar com DevTools: imagens fora do viewport não devem carregar no page load.

## 4. CODE SPLITTING — Rotas lazy (15 min)
Ficheiro: src/app/routes.ts
Converter todos os imports de páginas para React.lazy():
  const GaleriaPage = lazy(() => import("./components/GaleriaPage").then(m => ({ default: m.GaleriaPage })));
  (repetir para ObraPage, SobrePage, MentoriaPage, ContactosPage, PremioPage, etc.)
Envolver o router com <Suspense fallback={<SkeletonCard />}> em App.tsx ou main.tsx.
Manter AdminDashboard com lazy (já tem).
Verificar: npm run build deve gerar chunks separados por página.

## 5. ÍCONES PWA (5 min)
Criar pasta: public/icons/
Criar dois ficheiros: icon-192.png e icon-512.png
  (usar uma imagem do logo do atelier, redimensionar para 192x192 e 512x512)
Verificar: manifest.json já referencia /icons/icon-192.png e /icons/icon-512.png.

## 6. DEPLOY FINAL
npm run build (verificar 0 erros)
npx supabase functions deploy --all
Commit: "feat: polimento ux e performance para lançamento"
Verificar com superpowers:verification-before-completion antes do deploy.
```

---

### PROMPT PÓS-LANÇAMENTO — Primeira semana a vender

```
Projeto: Ana Alexandre Atelier — em produção. Lê 'prompt/checklist.md'
(secção 🟡 PÓS-LANÇAMENTO) para ver o que vem a seguir.

Os 3 dias de lançamento foram concluídos. Foco agora em analytics e admin.

Usa superpowers:brainstorming antes de qualquer funcionalidade nova.
Usa superpowers:writing-plans para planear cada feature antes de implementar.
Usa superpowers:subagent-driven-development para execução.

## Próximas prioridades (escolher uma):

A) ANALYTICS — ver quantas pessoas visitam e o que fazem
   - npm install @vercel/analytics @vercel/speed-insights
   - Adicionar <Analytics /> e <SpeedInsights /> em src/main.tsx
   - Dashboard Vercel: vercel.com/analytics

B) ADMIN — confirmar pagamentos por transferência
   - VendasSection: botão "Confirmar Pagamento" (muda pendente→pago)
   - Enviar email de confirmação ao cliente via send-email edge function
   - Mostrar referência única da venda (ANA-YYYY-NNN)

C) GALERIA — routing por slug e filtros
   - ObraPage: detetar se param é UUID ou slug, chamar função certa
   - GaleriaPage: filtros por técnica e estado (disponível/vendido)
   - URLs amigáveis: /galeria/paisagem-alentejana em vez de /galeria/uuid

Indica qual escolhes e o agente planeia e executa.
```

---

## ⚙️ COMANDOS ESSENCIAIS

```bash
# Dev
npm run dev

# Build
npm run build

# Deploy edge functions
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-email
npx supabase functions deploy notify-contacto

# Secrets Supabase (configurar ANTES do lançamento)
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set SITE_URL=https://ana-alexandre.pt
npx supabase secrets set NOTIFY_EMAIL=atelier.anaalexandre@gmail.com
npx supabase secrets set IBAN_ATELIER=PT50...

# Stripe webhook local (testes)
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```
