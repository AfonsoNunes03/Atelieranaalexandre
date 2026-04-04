import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../lib/cart";
import { enviarContacto, createVenda } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { useSEO } from "../../lib/useSEO";
import { createStripeCheckoutSession } from "../../lib/stripe";
import { sendTransferOrderEmail } from "../../lib/email";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, CreditCard, Shield } from "lucide-react";

const GOLD = "#C9A96E";
const CREAM = "#FAF8F5";

export function CheckoutPage() {
  useSEO({ title: "Finalizar Pedido", url: "/checkout" });

  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    mensagem: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");

  // Se o carrinho está vazio, redirecionar
  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#999", marginBottom: 24 }}>O teu carrinho está vazio.</p>
          <Link to="/galeria" style={{ color: GOLD, fontSize: "0.85rem", textDecoration: "none" }}>
            Ver Galeria →
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      // 0. Verificar disponibilidade das obras antes de prosseguir
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

      // 1. Criar registo de venda na base de dados (Sempre fazemos isto primeiro)
      const vendaId = await createVenda({
        cliente_nome: form.nome,
        cliente_email: form.email,
        cliente_tel: form.telefone || null,
        total: totalPrice,
        items: items.map(i => ({ id: i.id, titulo: i.titulo, preco: i.preco })),
        morada: form.morada || null,
        estado: 'pendente'
      });

      // 2. Se for Stripe, redirecionar para checkout Stripe real
      if (paymentMethod === "card") {
        await createStripeCheckoutSession(
          items.map((i) => ({
            id: i.id,
            titulo: i.titulo,
            preco: i.preco,
            imagem_url: i.imagem_url,
          })),
          form.email,
          vendaId
        );
        // A função acima redireciona para o Stripe — o clearCart()
        // acontece na página /sucesso após retorno do Stripe.
        return;
      }

      // 3. Se for Transferência, envia email de confirmação e avança para sucesso
      const obrasListTxt = items
        .map((i) => `• ${i.titulo} (${i.tecnica}) — €${i.preco.toLocaleString("pt-PT")}`)
        .join("\n");

      await Promise.all([
        enviarContacto({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || null,
          assunto: `Novo Pedido (Transferência) — ${items.length} obras`,
          mensagem: `MÉTODO: Transferência Bancária\n\nItens:\n${obrasListTxt}\n\nTotal: €${totalPrice}\n\nMorada:\n${form.morada}`,
        }),
        sendTransferOrderEmail({
          to: form.email,
          customerName: form.nome,
          total: totalPrice,
          items: items.map((i) => ({ titulo: i.titulo, preco: i.preco })),
        }),
      ]);

      clearCart();
      navigate("/sucesso");
    } catch (err: any) {
      console.error("Checkout Error:", err);
      // Se for um erro do Supabase sobre a tabela não existir:
      if (err.code === '42P01') {
        setError("Base de dados incompleta: A tabela 'vendas' não foi encontrada. Por favor corra o script SQL no Supabase.");
      } else {
        setError(err.message || "Erro ao processar o seu pedido. Por favor tente novamente.");
      }
      setSending(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div style={{ minHeight: "100vh", background: CREAM, padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem,4vw,2.8rem)", color: "#1a1a1a", margin: 0 }}>
            Checkout
          </h1>
          <div style={{ width: 40, height: 2, background: GOLD, margin: '16px auto' }} />
        </div>

        <div style={{ gap: 40 }} className="flex flex-col lg:flex-row items-start">

          {/* Coluna Esquerda: Formulário & Pagamento */}
          <div style={{ flex: 1.5, width: '100%' }}>
            
            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, padding: "clamp(16px,4vw,32px)", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: '1px solid rgba(0,0,0,0.03)' }}>
              
              <section style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: GOLD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>1</span>
                  Dados de Envio & Contacto
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                  <Field label="Nome completo *">
                    <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Nome Completo" style={inputStyle} />
                  </Field>
                  <Field label="Email *">
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@exemplo.com" style={inputStyle} />
                  </Field>
                  <Field label="Telefone">
                    <input name="telefone" type="tel" value={form.telefone} onChange={handleChange} placeholder="+351 9xx xxx xxx" style={inputStyle} />
                  </Field>
                  <Field label="Morada Completa *">
                    <input name="morada" value={form.morada} onChange={handleChange} required placeholder="Rua, Cidade, Código Postal" style={inputStyle} />
                  </Field>
                </div>
              </section>

              <section style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: GOLD, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: GOLD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>2</span>
                  Método de Pagamento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod("card")}
                    style={{ 
                      padding: 20, 
                      borderRadius: 10, 
                      border: `2px solid ${paymentMethod === 'card' ? GOLD : '#f0f0f0'}`,
                      background: paymentMethod === 'card' ? `${GOLD}05` : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: paymentMethod === 'card' ? '#1a1a1a' : '#666', marginBottom: 4 }}>💳 Cartão / Digital</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>Visa, Mastercard, Apple Pay via Stripe</div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod("transfer")}
                    style={{ 
                      padding: 20, 
                      borderRadius: 10, 
                      border: `2px solid ${paymentMethod === 'transfer' ? GOLD : '#f0f0f0'}`,
                      background: paymentMethod === 'transfer' ? `${GOLD}05` : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: paymentMethod === 'transfer' ? '#1a1a1a' : '#666', marginBottom: 4 }}>🏦 Transferência / MBWay</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>Receberá os dados após confirmar</div>
                  </div>
                </div>
              </section>

              {error && <p style={{ color: '#d41', fontSize: '0.85rem', marginBottom: 20 }}>{error}</p>}

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: "100%",
                  padding: "20px",
                  background: sending ? "#ccc" : `linear-gradient(to right, ${GOLD}, #d4b87a)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  cursor: sending ? "not-allowed" : "pointer",
                  boxShadow: `0 8px 25px ${GOLD}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12
                }}
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Pagar & Finalizar Pedido</>}
              </button>
            </form>
          </div>

          {/* Coluna Direita: Resumo Items */}
          <div className="lg:sticky" style={{ flex: 1, width: '100%', top: 88 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: "clamp(16px,3vw,28px)", border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 24 }}>O teu Pedido</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 30 }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "#f0ece6" }}>
                      <img src={item.imagem_url} alt={item.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.85rem", color: "#1a1a1a", margin: "0 0 4px", fontWeight: 500 }}>{item.titulo}</p>
                      <p style={{ fontSize: "0.7rem", color: "#aaa", margin: 0 }}>{item.tecnica}</p>
                      <p style={{ fontSize: "0.85rem", color: GOLD, margin: "4px 0 0", fontWeight: 500 }}>€{item.preco.toLocaleString("pt-PT")}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>Subtotal</span>
                  <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>€{totalPrice.toLocaleString("pt-PT")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>Portes de envio</span>
                  <span style={{ fontSize: "0.85rem", color: "#4ade80" }}>Gratuito</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a" }}>Total</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 600, color: GOLD }}>€{totalPrice.toLocaleString("pt-PT")}</span>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: '14px', background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
                 <p style={{ fontSize: '0.65rem', color: '#999', margin: 0, display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Shield size={12} color={GOLD} /> Compra 100% Segura & Encriptada
                 </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 6,
  fontSize: "0.85rem",
  color: "#1a1a1a",
  background: "#fafaf8",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function Field({ label, children, required, style }: { label: string; children: React.ReactNode; required?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#666", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
