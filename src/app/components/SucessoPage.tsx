import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useCart } from "../../lib/cart";

const GOLD = "#C4956A";
const CREAM = "#FAF8F5";
const CHARCOAL = "#1A1A1A";
const SLATE = "#64748B";

export function SucessoPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  // Limpa o carrinho quando vem de um pagamento Stripe (session_id no URL)
  useEffect(() => {
    if (searchParams.get("session_id")) {
      clearCart();
    }
  }, []);

  return (
    <div style={{ background: CREAM, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `${GOLD}20`, border: `2px solid ${GOLD}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <CheckCircle size={32} color={GOLD} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 400, color: CHARCOAL,
          margin: "0 0 16px", lineHeight: 1.2,
        }}>
          Mensagem enviada com sucesso
        </h1>

        <p style={{ fontSize: "1rem", color: SLATE, lineHeight: 1.7, margin: "0 0 12px" }}>
          Obrigada pelo teu contacto. Responderei brevemente.
        </p>
        <p style={{ fontSize: "0.88rem", color: SLATE, lineHeight: 1.6, margin: "0 0 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Mail size={14} color={GOLD} strokeWidth={1.5} />
          Receberás uma confirmação no teu email.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/contactos" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 10,
            border: `1px solid ${GOLD}50`,
            color: GOLD, fontSize: "0.88rem", fontWeight: 500,
            textDecoration: "none", background: `${GOLD}10`,
          }}>
            <ArrowLeft size={14} strokeWidth={2} /> Voltar aos contactos
          </Link>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 10,
            background: CHARCOAL, color: "#FFF",
            fontSize: "0.88rem", fontWeight: 500, textDecoration: "none",
          }}>
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
