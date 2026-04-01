import { Link } from "react-router-dom";
import { CheckCircle, Home, Image } from "lucide-react";
import { useSEO } from "../../lib/useSEO";

const GOLD = "#C9A96E";
const CREAM = "#FAF8F5";

export function SuccessPage() {
  useSEO({ title: "Pedido Recebido", url: "/sucesso" });

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 500, width: "100%", textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
        
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `rgba(201,169,110,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
          <CheckCircle size={40} color={GOLD} strokeWidth={1.5} />
        </div>

        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#1a1a1a", marginBottom: 16 }}>
          Pedido Recebido!
        </h1>
        
        <p style={{ color: "#777", fontSize: "1rem", lineHeight: 1.7, marginBottom: 40 }}>
          Muito obrigada pela tua confiança. O teu pedido foi registado com sucesso e a Ana Alexandre entrará em contacto contigo muito brevemente (24-48h) para confirmar todos os detalhes.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            to="/galeria"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px",
              background: GOLD,
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Image size={18} />
            Continuar a Explorar
          </Link>
          
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px",
              background: "transparent",
              color: "#999",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              border: "1px solid rgba(0,0,0,0.08)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.02)";
              e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#999";
            }}
          >
            <Home size={18} />
            Voltar ao Início
          </Link>
        </div>

        <p style={{ marginTop: 48, fontSize: "0.75rem", color: "#bbb" }}>
          Um email de confirmação foi enviado para o teu endereço.
        </p>
      </div>
    </div>
  );
}
