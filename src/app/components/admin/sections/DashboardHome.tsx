import { useState, useEffect } from "react";
import { getStatsAdmin } from "../../../../lib/db";
import { motion } from "motion/react";
import { 
  Palette, MessageSquare, Mail, TrendingUp, 
  Clock, ArrowUpRight, ArrowDownRight, Package, 
  ShoppingCart, Users, CreditCard, ChevronRight
} from "lucide-react";

const GOLD = "#C9A96E";
const SLATE = "#64748B";

export function DashboardHome() {
  const [stats, setStats] = useState({
    totalObras: 0,
    mensagensNaoLidas: 0,
    totalNewsletter: 0,
    vendasTotal: 0,
  });

  useEffect(() => {
    getStatsAdmin().then(data => {
      setStats(data);
    });
  }, []);

  const cards = [
    { label: "Obras no Acervo", value: stats.totalObras, icon: Palette, color: GOLD, trend: "Gestão" },
    { label: "Mensagens Pendentes", value: stats.mensagensNaoLidas, icon: MessageSquare, color: "#EF4444", trend: stats.mensagensNaoLidas > 0 ? "Rever" : "Limpo" },
    { label: "Assinantes News", value: stats.totalNewsletter, icon: Mail, color: "#3B82F6", trend: "Ativos" },
    { label: "Total Vendas", value: `€${stats.vendasTotal.toLocaleString('pt-PT')}`, icon: CreditCard, color: "#10B981", trend: "Bruto" },
  ];

  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Visão Geral
        </p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a2130", margin: 0 }}>Bem-vinda de volta, Ana</h1>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #eef0f3",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, 
                  background: `${card.color}15`, color: card.color,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                   {card.trend}
                </span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: SLATE, fontWeight: 500 }}>{card.label}</p>
                <h3 style={{ margin: 2, fontSize: "1.75rem", fontWeight: 700, color: "#1a2130" }}>{card.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Recent Activity Mock */}
        <Card title="Atividade Recente">
           <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { time: "Há 10 min", action: "Nova mensagem de", user: "Maria Silva", status: "Importante" },
                { time: "Há 2 horas", action: "Obra vendida:", user: "Luz de Inverno", status: "Pago" },
                { time: "Ontem", action: "Novo assinante:", user: "carlos@email.com", status: "Newsletter" },
                { time: "2 dias atrás", action: "Obra editada:", user: "Fragmentos II", status: "Atualizado" },
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 0",
                  borderBottom: idx === 3 ? "none" : "1px solid #f8f9fa" 
                }}>
                   <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", color: SLATE }}>
                      <Clock size={18} />
                   </div>
                   <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#333", fontWeight: 500 }}>
                        <span style={{ color: SLATE, fontWeight: 400 }}>{item.action} </span>
                        {item.user}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: SLATE }}>{item.time}</p>
                   </div>
                   <span style={{ fontSize: "0.65rem", padding: "4px 10px", borderRadius: 10, background: "#f0f2f5", color: SLATE, fontWeight: 600 }}>
                      {item.status}
                   </span>
                </div>
              ))}
           </div>
           <button style={{ 
              marginTop: 20, width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #eef0f3",
              background: "#fff", color: GOLD, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
           }}>
              Ver Histórico Completo <ChevronRight size={14} />
           </button>
        </Card>

        {/* Quick Links */}
        <Card title="Acesso Rápido">
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ActionButton label="Adicionar Obra" icon={PlusIcon} color={GOLD} />
              <ActionButton label="Editar Contactos" icon={PhoneIcon} color="#3B82F6" />
              <ActionButton label="Ver Galerias" icon={GlobeIcon} color="#10B981" />
           </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #eef0f3", padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 24px 0", color: "#1a2130" }}>{title}</h2>
      {children}
    </div>
  );
}

function ActionButton({ label, icon: Icon, color }: { label: string; icon: any; color: string }) {
  return (
    <button style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      borderRadius: 12, border: "1px solid #f1f3f5", background: "#fcfcfc",
      cursor: "pointer", transition: "all 0.2s", textAlign: "left"
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} />
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#333" }}>{label}</span>
    </button>
  );
}

// Minimal Icons
const PlusIcon = () => <Plus size={16} />;
const PhoneIcon = () => <Phone size={16} />;
const GlobeIcon = () => <Globe size={16} />;

import { Plus, Phone, Globe } from "lucide-react";
