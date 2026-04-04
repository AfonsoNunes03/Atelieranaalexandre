# Ana Alexandre Atelier — Checklist de Lançamento
> Última atualização: 2026-04-04 | Status: Ready for Production

---

## 🚀 PRIORIDADE MÁXIMA: Hostinger Launch
- [ ] Configurar `.htaccess` para suporte a SPA (React Router).
- [ ] Upload da pasta `dist/` para o public_html.
- [ ] Configurar `/api` no Hostinger (ou manter Edge Functions no Supabase).
- [ ] Validar SSL e domínios.

---

## ✅ CONCLUÍDO (Sessões Março/Abril)

**Core & Infra**
- Stack 100% funcional: React 18 + Supabase + Stripe + Resend.
- Base de dados tipada e protegida com RLS.
- Carrinho de compras persistente e validação de stock robusta.
- Fluxo de checkout com Stripe Webhooks ativo.

**Admin Premium (V3)** ✨
- Dashboard de luxo com gráficos dinâmicos (vendas, visitas, atividade).
- Sidebar boutique em Charcoal & Gold.
- Gestão completa de Acervo (CRUD com Upload), Vendas e Mensagens.
- Estatísticas de exposição em tempo real.

**Galeria & Assets**
- Galeria pública ligada ao Supabase (RLS fixado).
- Assets de alta resolução (Hero, Workshop, Gallery Wall) gerados e integrados.
- Logotipo e Favicon premium "AA" em dourado.
- SEO, Metatags OpenGraph e PWA configurados.

---

## 🛠️ PRÓXIMOS PASSOS (Pós-Lançamento)

**Nível 5: Refinamentos Profissionais**
- [ ] **Error Boundaries**: Proteção contra crashes em 404/500 em `App.tsx`.
- [ ] **i18n En/Es/Fr**: Completar as traduções para os mercados internacionais.
- [ ] **Lazy Loading**: Otimizar carregamento de imagens pesadas (`IntersectionObserver`).
- [ ] **Newsletter Broadcast**: Painel para enviar emails em massa para a lista VIP.
- [ ] **SEO Dinâmico**: `react-helmet-async` para metatags específicas de cada obra.

---

## 📚 Comandos Úteis
```bash
npm run build                   # Gerar bundle para Hostinger
npx supabase functions deploy --all  # Atualizar lógica de pagamentos
```
