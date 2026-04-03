import { useState, useEffect, useRef } from "react";
import { DashboardHome } from "./admin/sections/DashboardHome";
import { ObrasSection } from "./admin/sections/ObrasSection";
import VendasSection from "./admin/sections/VendasSection";
import { MensagensSection } from "./admin/sections/MensagensSection";
import { ConteudoSection } from "./admin/sections/ConteudoSection";
import {
  Home, Image, ShoppingCart, Users, Mail, Settings,
  Plus, Edit2, Trash2, Bell, Search, LogOut, Eye,
  TrendingUp, ArrowUpRight, ArrowDownRight, ChevronRight, X, Check,
  Filter, Download, AlertCircle, BarChart2, Package,
  Send, Palette, Globe, Lock, CreditCard, Save, RefreshCw,
  Sparkles, Menu, ChevronDown, MessageSquare, UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const GOLD      = "#C9A96E";
const GOLD_L    = "#D9BC8C";
const CHARCOAL  = "#1A1A1A";
const SLATE     = "#64748B";
const SLATE_L   = "#94A3B8";
const PAGE_BG   = "#F4F6F9";
const SIDEBAR_W = 256;

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Total de Obras",       value: "47",       sub: "+3 este mês",           icon: Palette,    accent: "#8B5CF6", bg: "#F5F3FF", trend: 1  },
  { label: "Vendas do Mês",        value: "€ 12.840", sub: "+18% vs mês anterior",  icon: TrendingUp, accent: "#10B981", bg: "#ECFDF5", trend: 1  },
  { label: "Clientes Registados",  value: "312",      sub: "+24 este mês",          icon: Users,      accent: "#3B82F6", bg: "#EFF6FF", trend: 1  },
  { label: "Encomendas Pendentes", value: "6",        sub: "−2 vs semana passada",  icon: Package,    accent: GOLD,      bg: "#FFFBF0", trend: -1 },
];

const MONTHLY_SALES = [
  { month: "Set",  value: 4200  },
  { month: "Out",  value: 6800  },
  { month: "Nov",  value: 5200  },
  { month: "Dez",  value: 9100  },
  { month: "Jan",  value: 7400  },
  { month: "Fev",  value: 8900  },
  { month: "Mar",  value: 12840 },
];

const WEEKLY_BARS = [
  { day: "Seg", v: 42 }, { day: "Ter", v: 68 }, { day: "Qua", v: 35 },
  { day: "Qui", v: 82 }, { day: "Sex", v: 58 }, { day: "Sáb", v: 91 }, { day: "Dom", v: 73 },
];

const ORDERS = [
  { id: "#0041", client: "Sofia Mendes",   initials: "SM", obra: "Luz de Inverno",  value: "€ 1.850", status: "Entregue",    date: "08 Mar 2026" },
  { id: "#0040", client: "André Costa",    initials: "AC", obra: "Alma Dourada",    value: "€ 3.200", status: "Processando", date: "07 Mar 2026" },
  { id: "#0039", client: "Mariana Faria",  initials: "MF", obra: "Névoa de Março",  value: "€ 950",   status: "Pendente",    date: "06 Mar 2026" },
  { id: "#0038", client: "Rui Barbosa",    initials: "RB", obra: "Silêncio Azul",   value: "€ 2.100", status: "Entregue",    date: "04 Mar 2026" },
  { id: "#0037", client: "Inês Cardoso",   initials: "IC", obra: "Terra Antiga",    value: "€ 4.400", status: "Cancelado",   date: "02 Mar 2026" },
];

const ALL_ORDERS = [
  ...ORDERS,
  { id: "#0036", client: "Diogo Pereira", initials: "DP", obra: "Ouro Branco",  value: "€ 780",   status: "Entregue",    date: "28 Fev 2026" },
  { id: "#0035", client: "Lúcia Santos",  initials: "LS", obra: "Mar Interior", value: "€ 2.750", status: "Processando", date: "25 Fev 2026" },
  { id: "#0034", client: "Pedro Alves",   initials: "PA", obra: "Crepúsculo",   value: "€ 1.200", status: "Entregue",    date: "20 Fev 2026" },
];

const OBRAS_INIT = [
  { id: 1, image: "https://images.unsplash.com/photo-1683223585212-6e3cf4cf9473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Luz de Inverno",  technique: "Óleo sobre tela",     dimensions: "80 × 100 cm",  year: 2024, price: "€ 1.850", status: "Disponível" },
  { id: 2, image: "https://images.unsplash.com/photo-1768522277818-56d9f6a1636a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Alma Dourada",    technique: "Acrílico sobre tela", dimensions: "120 × 150 cm", year: 2025, price: "€ 3.200", status: "Vendido"    },
  { id: 3, image: "https://images.unsplash.com/photo-1667980898743-fcfe470b7d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Névoa de Março",  technique: "Aguarela",            dimensions: "50 × 70 cm",   year: 2025, price: "€ 950",   status: "Disponível" },
  { id: 4, image: "https://images.unsplash.com/photo-1720323808592-71be40bf3070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Silêncio Azul",   technique: "Óleo sobre tela",     dimensions: "100 × 120 cm", year: 2024, price: "€ 2.100", status: "Reservado"  },
  { id: 5, image: "https://images.unsplash.com/photo-1758522277818-56d9f6a1636a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Terra Antiga",    technique: "Técnica Mista",       dimensions: "140 × 180 cm", year: 2023, price: "€ 4.400", status: "Vendido"    },
  { id: 6, image: "https://images.unsplash.com/photo-1683223585212-6e3cf4cf9473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Crepúsculo",      technique: "Óleo sobre tela",     dimensions: "60 × 80 cm",   year: 2026, price: "€ 1.200", status: "Disponível" },
  { id: 7, image: "https://images.unsplash.com/photo-1768522277818-56d9f6a1636a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Mar Interior",    technique: "Acrílico sobre tela", dimensions: "90 × 110 cm",  year: 2026, price: "€ 2.750", status: "Disponível" },
  { id: 8, image: "https://images.unsplash.com/photo-1667980898743-fcfe470b7d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200", title: "Ouro Branco",     technique: "Óleo sobre madeira",  dimensions: "40 × 60 cm",   year: 2025, price: "€ 780",   status: "Reservado"  },
];

const CLIENTES = [
  { id: 1, name: "Sofia Mendes",  initials: "SM", email: "sofia.mendes@gmail.com", location: "Lisboa",  joined: "Jan 2025", orders: 4, total: "€ 7.200",  status: "Ativo"   },
  { id: 2, name: "André Costa",   initials: "AC", email: "a.costa@outlook.com",    location: "Porto",   joined: "Mar 2025", orders: 2, total: "€ 5.100",  status: "Ativo"   },
  { id: 3, name: "Mariana Faria", initials: "MF", email: "mariana.f@gmail.com",    location: "Coimbra", joined: "Jun 2024", orders: 1, total: "€ 950",    status: "Ativo"   },
  { id: 4, name: "Rui Barbosa",   initials: "RB", email: "rui.barbosa@sapo.pt",    location: "Setúbal", joined: "Nov 2024", orders: 3, total: "€ 6.300",  status: "Inativo" },
  { id: 5, name: "Inês Cardoso",  initials: "IC", email: "ines.c@gmail.com",       location: "Braga",   joined: "Feb 2026", orders: 1, total: "€ 4.400",  status: "Ativo"   },
  { id: 6, name: "Diogo Pereira", initials: "DP", email: "d.pereira@gmail.com",    location: "Évora",   joined: "Dec 2023", orders: 6, total: "€ 14.800", status: "Ativo"   },
];

const NEWSLETTER_SUBS = [
  { id: 1, name: "Sofia Mendes",  email: "sofia.mendes@gmail.com",  joined: "12 Jan 2025", active: true  },
  { id: 2, name: "André Costa",   email: "a.costa@outlook.com",     joined: "05 Mar 2025", active: true  },
  { id: 3, name: "Mariana Faria", email: "mariana.f@gmail.com",     joined: "22 Jun 2024", active: false },
  { id: 4, name: "Lúcia Santos",  email: "lucia.santos@gmail.com",  joined: "10 Ago 2024", active: true  },
  { id: 5, name: "Pedro Alves",   email: "pedro.alves@sapo.pt",     joined: "17 Set 2024", active: true  },
  { id: 6, name: "Ana Ribeiro",   email: "ana.ribeiro@gmail.com",   joined: "03 Jan 2026", active: true  },
  { id: 7, name: "Carlos Melo",   email: "carlos.melo@gmail.com",   joined: "28 Fev 2026", active: false },
];

const NOTIFICATIONS_DATA = [
  { id: 1, type: "order",      title: "Nova encomenda #0042",      desc: "Sofia Mendes · Luz de Inverno",         time: "há 5 min",  read: false },
  { id: 2, type: "message",    title: "Nova mensagem recebida",    desc: "Pedro Alves quer saber sobre mentoria", time: "há 23 min", read: false },
  { id: 3, type: "subscriber", title: "Novo subscritor",           desc: "ana.ribeiro@gmail.com subscreveu",      time: "há 1h",     read: true  },
  { id: 4, type: "order",      title: "Encomenda #0041 entregue",  desc: "Mariana Faria · Névoa de Março",        time: "há 2h",     read: true  },
];

// ── Status badge ──────────────────────────────────────────────────────────────

type ST = "Disponível"|"Reservado"|"Vendido"|"Entregue"|"Processando"|"Pendente"|"Cancelado"|"Ativo"|"Inativo";

const S_MAP: Record<ST, { bg: string; color: string }> = {
  Disponível:  { bg: "#DCFCE7", color: "#16A34A" },
  Reservado:   { bg: "#FEF3C7", color: "#D97706" },
  Vendido:     { bg: "#FCE7F3", color: "#BE185D" },
  Entregue:    { bg: "#DCFCE7", color: "#16A34A" },
  Processando: { bg: "#DBEAFE", color: "#1D4ED8" },
  Pendente:    { bg: "#FEF9C3", color: "#A16207" },
  Cancelado:   { bg: "#FEE2E2", color: "#DC2626" },
  Ativo:       { bg: "#DCFCE7", color: "#16A34A" },
  Inativo:     { bg: "#F1F5F9", color: "#64748B" },
};

function Badge({ s }: { s: ST }) {
  const st = S_MAP[s] ?? S_MAP["Pendente"];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 99,
      background: st.bg, color: st.color,
      fontSize: "0.7rem", fontWeight: 600,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>{s}</span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#8B5CF6","#3B82F6","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4"];
function Avatar({ initials, size = 30 }: { initials: string; size?: number }) {
  const idx = initials.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: AVATAR_COLORS[idx] + "22",
      border: `1.5px solid ${AVATAR_COLORS[idx]}44`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.36, color: AVATAR_COLORS[idx], fontWeight: 600 }}>{initials}</span>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: "11px 16px", textAlign: "left",
                fontSize: "0.65rem", color: SLATE_L,
                fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                borderBottom: "1px solid #EEF2F7", background: "#FAFBFC",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <tr style={{ borderBottom: last ? "none" : "1px solid #EEF2F7" }}>{children}</tr>;
}

function TD({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "12px 16px", ...style }}>{children}</td>;
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 20px 14px",
      borderBottom: "1px solid #EEF2F7",
    }}>
      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: CHARCOAL }}>{title}</span>
      {action}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────

function GoldBtn({ onClick, children, type = "button" }: { onClick?: () => void; children: React.ReactNode; type?: "button"|"submit" }) {
  return (
    <button type={type} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "9px 18px", borderRadius: 10, border: "none",
      background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_L} 100%)`,
      color: "#1A1A1A", fontSize: "0.78rem", fontWeight: 700,
      letterSpacing: "0.04em", cursor: "pointer",
      boxShadow: `0 2px 8px ${GOLD}50`,
      transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

function GhostBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "7px 14px", borderRadius: 8,
      border: "1px solid #E2E8F0", background: "#FFFFFF",
      color: SLATE, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
    }}>{children}</button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 99, border: "none",
      background: on ? GOLD : "#E2E8F0",
      cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, width: 16, height: 16,
        borderRadius: "50%", background: "#FFF",
        left: on ? 21 : 3, transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }} />
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ s }: { s: typeof STATS[0] }) {
  const Icon = s.icon;
  const up = s.trend >= 0;
  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} strokeWidth={1.8} color={s.accent} />
        </div>
        <span style={{
          display: "flex", alignItems: "center", gap: 2,
          background: up ? "#DCFCE7" : "#FEE2E2",
          color: up ? "#16A34A" : "#DC2626",
          fontSize: "0.65rem", fontWeight: 700,
          padding: "3px 8px", borderRadius: 99,
        }}>
          {up
            ? <ArrowUpRight size={10} strokeWidth={2.5} />
            : <ArrowDownRight size={10} strokeWidth={2.5} />}
          {up ? "Subida" : "Descida"}
        </span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
      <div style={{ fontSize: "0.78rem", color: SLATE, marginTop: 4 }}>{s.label}</div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #EEF2F7" }}>
        <span style={{ fontSize: "0.68rem", color: SLATE_L }}>{s.sub}</span>
      </div>
    </Card>
  );
}

// ── Custom tooltip for recharts ───────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A1A1A", borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    }}>
      <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: GOLD }}>
        € {payload[0].value.toLocaleString("pt-PT")}
      </p>
    </div>
  );
}

// ── NovaObra modal ────────────────────────────────────────────────────────────

type NovaObraForm = { title: string; technique: string; dimensions: string; price: string; year: string; status: string; };
const EMPTY_FORM: NovaObraForm = { title: "", technique: "", dimensions: "", price: "", year: new Date().getFullYear().toString(), status: "Disponível" };

function NovaObraModal({ onClose, onSave }: { onClose: () => void; onSave: (f: NovaObraForm) => void }) {
  const [form, setForm] = useState<NovaObraForm>(EMPTY_FORM);
  const [step, setStep] = useState<"form" | "success">("form");
  const [errors, setErrors] = useState<Partial<NovaObraForm>>({});

  const set = (k: keyof NovaObraForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<NovaObraForm> = {};
    if (!form.title.trim())     e.title     = "Campo obrigatório";
    if (!form.technique.trim()) e.technique = "Campo obrigatório";
    if (!form.price.trim())     e.price     = "Campo obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setStep("success");
    setTimeout(() => { onSave(form); onClose(); }, 1600);
  };

  const inputCss: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #E2E8F0", borderRadius: 10,
    fontSize: "0.85rem", color: CHARCOAL, background: PAGE_BG,
    outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  };
  const errCss: React.CSSProperties = { ...inputCss, borderColor: "#FCA5A5" };
  const labelCss: React.CSSProperties = {
    fontSize: "0.65rem", color: SLATE, fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase",
    display: "block", marginBottom: 5,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: "#FFFFFF", borderRadius: 20, width: 500, maxWidth: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>

        {step === "success" ? (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#DCFCE7",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Check size={28} color="#16A34A" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: "1.15rem", fontWeight: 700, color: CHARCOAL, margin: "0 0 6px" }}>Obra adicionada!</p>
            <p style={{ fontSize: "0.82rem", color: SLATE, margin: 0 }}>
              <strong style={{ color: GOLD }}>{form.title}</strong> foi adicionada com sucesso.
            </p>
          </div>
        ) : (
          <>
            {/* Gold header */}
            <div style={{
              background: `linear-gradient(130deg, #2C2318 0%, #3A2D18 60%, ${GOLD}55 100%)`,
              padding: "22px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${GOLD}30`, border: `1px solid ${GOLD}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Palette size={16} color={GOLD} strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0, fontFamily: "'Playfair Display', serif" }}>Adicionar Nova Obra</p>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>Preenche os detalhes da obra</p>
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer", borderRadius: 8, padding: 6, color: "#FFFFFF", display: "flex",
              }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelCss}>Título da Obra *</label>
                <input value={form.title} onChange={set("title")} placeholder="ex: Luz de Inverno" style={errors.title ? errCss : inputCss} />
                {errors.title && <p style={{ fontSize: "0.68rem", color: "#DC2626", margin: "4px 0 0" }}>{errors.title}</p>}
              </div>
              <div>
                <label style={labelCss}>Técnica *</label>
                <input value={form.technique} onChange={set("technique")} placeholder="ex: Óleo sobre tela" style={errors.technique ? errCss : inputCss} />
                {errors.technique && <p style={{ fontSize: "0.68rem", color: "#DC2626", margin: "4px 0 0" }}>{errors.technique}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelCss}>Dimensões</label>
                  <input value={form.dimensions} onChange={set("dimensions")} placeholder="ex: 80 × 100 cm" style={inputCss} />
                </div>
                <div>
                  <label style={labelCss}>Ano</label>
                  <input value={form.year} onChange={set("year")} placeholder="2026" type="number" style={inputCss} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelCss}>Preço (€) *</label>
                  <input value={form.price} onChange={set("price")} placeholder="0.00" type="number" style={errors.price ? errCss : inputCss} />
                  {errors.price && <p style={{ fontSize: "0.68rem", color: "#DC2626", margin: "4px 0 0" }}>{errors.price}</p>}
                </div>
                <div>
                  <label style={labelCss}>Estado</label>
                  <select value={form.status} onChange={set("status")} style={inputCss}>
                    <option>Disponível</option><option>Reservado</option><option>Vendido</option>
                  </select>
                </div>
              </div>
              <div style={{ border: `2px dashed ${GOLD}55`, borderRadius: 12, padding: "18px", textAlign: "center", background: `${GOLD}06`, cursor: "pointer" }}>
                <Image size={20} color={GOLD} strokeWidth={1.5} style={{ margin: "0 auto 6px" }} />
                <p style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 600, margin: "0 0 2px" }}>Clique para upload da imagem</p>
                <p style={{ fontSize: "0.65rem", color: SLATE_L, margin: 0 }}>PNG, JPG até 10 MB</p>
              </div>
            </div>

            <div style={{ padding: "16px 28px 22px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #EEF2F7" }}>
              <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
              <GoldBtn onClick={handleSave}><Check size={14} strokeWidth={2.5} /> Guardar Obra</GoldBtn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({ title, desc, onCancel, onConfirm }: {
  title: string; desc: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onCancel}>
      <div style={{
        background: "#FFFFFF", borderRadius: 18, padding: "32px 28px",
        width: 360, maxWidth: "100%",
        boxShadow: "0 16px 48px rgba(0,0,0,0.15)", textAlign: "center",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <AlertCircle size={22} color="#DC2626" strokeWidth={1.8} />
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: CHARCOAL, margin: "0 0 8px" }}>{title}</p>
        <p style={{ fontSize: "0.8rem", color: SLATE, margin: "0 0 24px" }}>{desc}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <GhostBtn onClick={onCancel}>Cancelar</GhostBtn>
          <button onClick={onConfirm} style={{
            padding: "9px 22px", borderRadius: 10, border: "none",
            background: "#DC2626", color: "#FFFFFF",
            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
          }}>Apagar</button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

type Screen = "inicio"|"obras"|"encomendas"|"newsletter"|"definicoes";

const NAV: { id: Screen; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }[] = [
  { id: "inicio",      label: "Início",     icon: Home         },
  { id: "obras",       label: "Obras",      icon: Image        },
  { id: "encomendas",  label: "Encomendas", icon: ShoppingCart },
  { id: "newsletter",  label: "Mensagens",  icon: Mail         },
  { id: "definicoes",  label: "Definições", icon: Settings     },
];

function Sidebar({ active, setActive, open, onClose }: {
  active: Screen; setActive: (s: Screen) => void; open: boolean; onClose: () => void;
}) {
  const navigate = useNavigate();
  const sidebarContent = (
    <aside style={{
      width: SIDEBAR_W, flexShrink: 0,
      background: "#FFFFFF",
      boxShadow: "1px 0 0 #EEF2F7",
      display: "flex", flexDirection: "column",
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}15)`,
            border: `1px solid ${GOLD}40`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GOLD, fontSize: "0.88rem", fontStyle: "italic" }}>AA</span>
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.01em" }}>Ana Alexandre</div>
            <div style={{ fontSize: "0.65rem", color: SLATE_L, letterSpacing: "0.06em", textTransform: "uppercase" }}>Atelier · Admin</div>
          </div>
        </div>
        {/* Mobile close */}
        <button onClick={onClose} className="lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: SLATE_L, padding: 2 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ height: 1, background: "#EEF2F7", margin: "0 16px" }} />

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", position: "relative" }}>
        <p style={{ fontSize: "0.58rem", color: SLATE_L, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 10px 6px", fontWeight: 600 }}>Principal</p>
        {NAV.slice(0, 5).map(item => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setActive(item.id); onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px", borderRadius: 10,
              border: "none", cursor: "pointer",
              background: isActive ? `${GOLD}14` : "transparent",
              color: isActive ? GOLD : SLATE,
              marginBottom: 2, transition: "all 0.15s",
            }}>
              <Icon size={16} strokeWidth={isActive ? 2 : 1.6} color={isActive ? GOLD : SLATE} />
              <span style={{ fontSize: "0.82rem", fontWeight: isActive ? 600 : 400, flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.id === "encomendas" && (
                <span style={{ background: GOLD, color: "#1A1A1A", fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>6</span>
              )}
            </button>
          );
        })}

        <p style={{ fontSize: "0.58rem", color: SLATE_L, letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px 10px 6px", fontWeight: 600 }}>Sistema</p>
        {NAV.slice(5).map(item => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setActive(item.id); onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px", borderRadius: 10,
              border: "none", cursor: "pointer",
              background: isActive ? `${GOLD}14` : "transparent",
              color: isActive ? GOLD : SLATE,
              marginBottom: 2, transition: "all 0.15s",
            }}>
              <Icon size={16} strokeWidth={isActive ? 2 : 1.6} color={isActive ? GOLD : SLATE} />
              <span style={{ fontSize: "0.82rem", fontWeight: isActive ? 600 : 400, textAlign: "left" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 14px 18px", borderTop: "1px solid #EEF2F7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: PAGE_BG }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `${GOLD}25`, border: `1.5px solid ${GOLD}50`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 700 }}>A</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: CHARCOAL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Ana Alexandre</div>
            <div style={{ fontSize: "0.62rem", color: SLATE_L }}>Administradora</div>
          </div>
          <button
            title="Ver website"
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", color: SLATE_L, padding: 2, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.color = SLATE_L)}
          >
            <Globe size={14} strokeWidth={1.5} />
          </button>
          <button
            title="Sair"
            onClick={async () => { await signOut(); navigate("/login"); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: SLATE_L, padding: 2, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#CC3333")}
            onMouseLeave={e => (e.currentTarget.style.color = SLATE_L)}
          >
            <LogOut size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex" style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden"
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
          onClick={onClose}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", zIndex: 101 }} onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

const TITLES: Record<Screen, string> = {
  inicio: "Visão Geral", obras: "Gestão de Obras", encomendas: "Encomendas",
  clientes: "Clientes", newsletter: "Newsletter", definicoes: "Definições",
};

function Topbar({ screen, q, setQ, onMenuClick }: {
  screen: Screen; q: string; setQ: (v: string) => void; onMenuClick: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS_DATA);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        bellRef.current && !bellRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const notifIcon = (type: string) => {
    if (type === "order")      return <ShoppingCart size={13} color={GOLD} strokeWidth={1.8} />;
    if (type === "message")    return <MessageSquare size={13} color="#3B82F6" strokeWidth={1.8} />;
    if (type === "subscriber") return <UserPlus size={13} color="#10B981" strokeWidth={1.8} />;
    return <Bell size={13} color={SLATE} strokeWidth={1.8} />;
  };

  return (
    <header style={{
      height: 60, background: "#FFFFFF",
      boxShadow: "0 1px 0 #EEF2F7",
      display: "flex", alignItems: "center",
      padding: "0 20px", gap: 12,
      position: "sticky", top: 0, zIndex: 20,
    }}>
      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick} className="lg:hidden" style={{
        background: "none", border: "none", cursor: "pointer",
        color: CHARCOAL, display: "flex", alignItems: "center", padding: 4,
      }}>
        <Menu size={20} strokeWidth={1.8} />
      </button>

      <span style={{ fontSize: "1rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        {TITLES[screen]}
      </span>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: PAGE_BG, border: "1px solid #E2E8F0",
        borderRadius: 10, padding: "7px 13px", width: "clamp(140px, 18vw, 220px)",
      }}>
        <Search size={13} strokeWidth={2} color={SLATE_L} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Pesquisar…"
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: "0.8rem", color: CHARCOAL, width: "100%",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {q && (
          <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: SLATE_L, display: "flex", padding: 0 }}>
            <X size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Bell */}
      <div style={{ position: "relative" }}>
        <button
          ref={bellRef}
          onClick={() => setNotifOpen(v => !v)}
          style={{
            position: "relative", width: 36, height: 36, borderRadius: 10,
            background: notifOpen ? `${GOLD}15` : PAGE_BG,
            border: `1px solid ${notifOpen ? GOLD + "40" : "#E2E8F0"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: SLATE, transition: "all 0.15s",
          }}>
          <Bell size={15} strokeWidth={1.8} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 8, height: 8, borderRadius: "50%",
              background: GOLD, border: "2px solid #FFF",
            }} />
          )}
        </button>

        {notifOpen && (
          <div ref={panelRef} style={{
            position: "absolute", top: 44, right: 0,
            width: 320, background: "#FFFFFF",
            borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            border: "1px solid #EEF2F7", zIndex: 50, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px 10px",
              borderBottom: "1px solid #EEF2F7",
            }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL }}>Notificações</span>
              <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.68rem", color: GOLD, fontWeight: 600,
              }}>
                Marcar todas como lidas
              </button>
            </div>

            {notifs.map(n => (
              <div
                key={n.id}
                onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  background: n.read ? "transparent" : `${GOLD}07`,
                  borderBottom: "1px solid #EEF2F7",
                  cursor: "pointer", transition: "background 0.15s",
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: n.read ? PAGE_BG : `${GOLD}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${n.read ? "#E2E8F0" : GOLD + "30"}`,
                }}>
                  {notifIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: n.read ? 500 : 700, color: CHARCOAL, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: SLATE, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.desc}</p>
                  <p style={{ fontSize: "0.65rem", color: SLATE_L, margin: "3px 0 0" }}>{n.time}</p>
                </div>
              </div>
            ))}

            <div style={{ padding: "10px 16px", textAlign: "center" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: GOLD, fontWeight: 600 }}>
                Ver todas as notificações
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: `${GOLD}25`, border: `2px solid ${GOLD}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: GOLD }}>A</span>
      </div>
    </header>
  );
}

// ── Início ─────────────────────────────────────────────────────────────────────

function InicioScreen({ setActive }: { setActive: (s: Screen) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [recentAdded, setRecentAdded] = useState<NovaObraForm | null>(null);

  const handleSave = (form: NovaObraForm) => {
    setRecentAdded(form);
    setTimeout(() => setRecentAdded(null), 4000);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Toast */}
      {recentAdded && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 300,
          background: "#FFFFFF", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
          border: "1px solid #DCFCE7",
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={16} color="#16A34A" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: CHARCOAL, margin: "0 0 2px" }}>Obra adicionada com sucesso</p>
            <p style={{ fontSize: "0.72rem", color: SLATE, margin: 0 }}>"{recentAdded.title}" · {recentAdded.status}</p>
          </div>
        </div>
      )}

      {showModal && <NovaObraModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Hero banner — dark gold editorial */}
      <div style={{
        borderRadius: 16, overflow: "hidden", position: "relative",
        background: "linear-gradient(130deg, #1A1A1A 0%, #2C2318 55%, #3A2D18 100%)",
        padding: "clamp(20px,3vw,32px) clamp(20px,4vw,36px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", right: 80, top: -40, width: 180, height: 180, borderRadius: "50%", background: `${GOLD}10` }} />
        <div style={{ position: "absolute", right: 30, top: 15, width: 90, height: 90, borderRadius: "50%", background: `${GOLD}07` }} />
        <div style={{ position: "absolute", right: 200, bottom: -25, width: 90, height: 90, borderRadius: "50%", background: `${GOLD}08` }} />
        <div style={{ position: "absolute", top: 20, right: 360, width: 1, height: "calc(100% - 40px)", background: `${GOLD}20` }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={13} color={GOLD} strokeWidth={1.5} />
            <span style={{ fontSize: "0.65rem", color: `${GOLD}AA`, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 }}>
              Sábado, 14 de Março 2026
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.4rem,2.5vw,1.8rem)", fontWeight: 400, color: "#FFFFFF",
            margin: "0 0 8px", lineHeight: 1.2,
          }}>
            Bem-vinda, <span style={{ fontStyle: "italic", color: GOLD }}>Ana.</span>
          </h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            6 encomendas pendentes · 2 mensagens por responder
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <button onClick={() => setActive("encomendas")} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10,
            border: `1px solid ${GOLD}40`,
            background: `${GOLD}15`,
            color: GOLD_L, fontSize: "0.78rem", fontWeight: 500,
            cursor: "pointer",
          }}>
            <ShoppingCart size={13} strokeWidth={1.8} /> Encomendas
          </button>
          <GoldBtn onClick={() => setShowModal(true)}>
            <Plus size={13} strokeWidth={2.5} /> Nova Obra
          </GoldBtn>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {STATS.map((s, i) => <StatCard key={i} s={s} />)}
      </div>

      {/* Monthly sales chart */}
      <Card style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: CHARCOAL, display: "block" }}>Vendas Mensais</span>
            <span style={{ fontSize: "0.72rem", color: SLATE_L }}>Últimos 7 meses</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em" }}>€ 54.440</span>
            <span style={{ fontSize: "0.68rem", color: "#16A34A", fontWeight: 700, background: "#DCFCE7", padding: "2px 8px", borderRadius: 99 }}>↑ 18%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY_SALES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradMonthlySales" x1="0" y1="0" x2="0" y2="1">
                <stop key="grad-stop-0" offset="5%"  stopColor={GOLD} stopOpacity={0.25} />
                <stop key="grad-stop-1" offset="95%" stopColor={GOLD} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid key="cart-grid" strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
            <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: SLATE_L }} axisLine={false} tickLine={false} />
            <YAxis key="y-axis" tick={{ fontSize: 10, fill: SLATE_L }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
            <Tooltip key="chart-tooltip" content={<CustomTooltip />} />
            <Area
              key="area-value"
              type="monotone" dataKey="value" stroke={GOLD} strokeWidth={2.5}
              fill="url(#goldGradMonthlySales)" dot={{ fill: GOLD, strokeWidth: 0, r: 3 }}
              activeDot={{ fill: GOLD, r: 5, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(240px,300px)", gap: 16 }}>

        {/* Orders table */}
        <Card>
          <CardHeader
            title="Últimas Encomendas"
            action={
              <button onClick={() => setActive("encomendas")} style={{
                background: "none", border: "none", cursor: "pointer",
                color: GOLD, fontSize: "0.75rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 3,
              }}>
                Ver todas <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            }
          />
          <Table headers={["ID", "Cliente", "Obra", "Valor", "Estado", "Data"]}>
            {ORDERS.map((o, i) => (
              <TR key={o.id} last={i === ORDERS.length - 1}>
                <TD><span style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 600 }}>{o.id}</span></TD>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar initials={o.initials} size={26} />
                    <span style={{ fontSize: "0.8rem", color: CHARCOAL, fontWeight: 500 }}>{o.client}</span>
                  </div>
                </TD>
                <TD><span style={{ fontSize: "0.78rem", color: SLATE }}>{o.obra}</span></TD>
                <TD><span style={{ fontSize: "0.8rem", fontWeight: 600, color: CHARCOAL }}>{o.value}</span></TD>
                <TD><Badge s={o.status as ST} /></TD>
                <TD><span style={{ fontSize: "0.73rem", color: SLATE_L }}>{o.date}</span></TD>
              </TR>
            ))}
          </Table>
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Weekly bar chart — pure CSS, no recharts */}
          <Card style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: CHARCOAL }}>Vendas da Semana</span>
              <BarChart2 size={14} color={GOLD} strokeWidth={1.8} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
              {WEEKLY_BARS.map((b, i) => (
                <div key={`wbar-${i}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div
                      title={`${b.day}: €${b.v}`}
                      style={{
                        width: "100%",
                        height: `${b.v}%`,
                        borderRadius: "4px 4px 0 0",
                        background: i === 5
                          ? `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_L} 100%)`
                          : "#E2E8F0",
                        cursor: "default",
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: "0.55rem",
                    color: i === 5 ? GOLD : SLATE_L,
                    fontWeight: i === 5 ? 700 : 400,
                  }}>{b.day}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #EEF2F7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em" }}>€ 3.420</span>
                <span style={{ fontSize: "0.68rem", color: "#16A34A", marginLeft: 6, fontWeight: 600 }}>↑ 12%</span>
              </div>
              <span style={{ fontSize: "0.65rem", color: SLATE_L }}>vs semana anterior</span>
            </div>
          </Card>

          {/* Quick actions */}
          <Card style={{ padding: "18px 20px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: CHARCOAL, display: "block", marginBottom: 12 }}>Ações Rápidas</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Adicionar Nova Obra",      icon: Palette,      screen: "obras"      as Screen },
                { label: "Ver Encomendas Pendentes", icon: Package,      screen: "encomendas" as Screen },
                { label: "Enviar Newsletter",         icon: Send,         screen: "newsletter" as Screen },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={() => setActive(a.screen)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    border: "1px solid #EEF2F7", background: PAGE_BG,
                    cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${GOLD}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={13} strokeWidth={1.8} color={GOLD} />
                    </div>
                    <span style={{ fontSize: "0.78rem", color: CHARCOAL, flex: 1 }}>{a.label}</span>
                    <ChevronRight size={13} color={SLATE_L} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Obras ──────────────────────────────────────────────────────────────────────

function ObrasScreen({ globalQ }: { globalQ: string }) {
  const [obras, setObras] = useState(OBRAS_INIT);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [localSearch, setLocalSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const q = globalQ || localSearch;
  const statuses = ["Todos", "Disponível", "Reservado", "Vendido"];
  const filtered = obras.filter(o =>
    (filterStatus === "Todos" || o.status === filterStatus) &&
    (!q || o.title.toLowerCase().includes(q.toLowerCase()) || o.technique.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "6px 14px", borderRadius: 99, border: "1.5px solid",
              borderColor: filterStatus === s ? GOLD : "#E2E8F0",
              background: filterStatus === s ? `${GOLD}15` : "#FFFFFF",
              color: filterStatus === s ? GOLD : SLATE,
              fontSize: "0.74rem", fontWeight: filterStatus === s ? 700 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}>{s}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "7px 12px" }}>
          <Search size={13} color={SLATE_L} strokeWidth={2} />
          <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Pesquisar obras…" style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: "0.78rem", color: CHARCOAL, fontFamily: "'Inter', sans-serif", width: 140,
          }} />
        </div>

        <GoldBtn onClick={() => setShowModal(true)}>
          <Plus size={13} strokeWidth={2.5} /> Nova Obra
        </GoldBtn>
      </div>

      <p style={{ fontSize: "0.72rem", color: SLATE_L, marginBottom: 12 }}>
        {filtered.length} obra{filtered.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}
      </p>

      <Card>
        <Table headers={["Obra", "Técnica", "Dimensões", "Ano", "Preço", "Estado", "Ações"]}>
          {filtered.map((o, i) => (
            <TR key={o.id} last={i === filtered.length - 1}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #EEF2F7" }}>
                    <img src={o.image} alt={o.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: CHARCOAL }}>{o.title}</span>
                </div>
              </TD>
              <TD><span style={{ fontSize: "0.78rem", color: SLATE }}>{o.technique}</span></TD>
              <TD><span style={{ fontSize: "0.75rem", color: SLATE_L }}>{o.dimensions}</span></TD>
              <TD><span style={{ fontSize: "0.78rem", color: SLATE_L }}>{o.year}</span></TD>
              <TD><span style={{ fontSize: "0.82rem", fontWeight: 700, color: CHARCOAL }}>{o.price}</span></TD>
              <TD><Badge s={o.status as ST} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E2E8F0", background: "#FFFFFF", cursor: "pointer", color: SLATE, fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                    <Edit2 size={11} strokeWidth={2} /> Editar
                  </button>
                  <button onClick={() => setDeleteId(o.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #FEE2E2", background: "#FFF5F5", cursor: "pointer", color: "#DC2626", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
                    <Trash2 size={11} strokeWidth={2} /> Apagar
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: SLATE_L }}>Nenhuma obra encontrada{q ? ` para "${q}"` : ""}.</p>
          </div>
        )}
      </Card>

      {showModal && <NovaObraModal onClose={() => setShowModal(false)} onSave={() => {}} />}
      {deleteId !== null && (
        <DeleteModal
          title="Apagar obra?"
          desc="Esta ação é irreversível e permanente."
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { setObras(p => p.filter(o => o.id !== deleteId)); setDeleteId(null); }}
        />
      )}
    </div>
  );
}

// ── Encomendas ────────────────────────────────────────────────────────────────

function EncomendasScreen({ globalQ }: { globalQ: string }) {
  const [filter, setFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const statuses = ["Todos", "Pendente", "Processando", "Entregue", "Cancelado"];

  const filtered = ALL_ORDERS.filter(o =>
    (filter === "Todos" || o.status === filter) &&
    (!globalQ || o.client.toLowerCase().includes(globalQ.toLowerCase()) || o.obra.toLowerCase().includes(globalQ.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
              padding: "6px 14px", borderRadius: 99, border: "1.5px solid",
              borderColor: filter === s ? GOLD : "#E2E8F0",
              background: filter === s ? `${GOLD}15` : "#FFFFFF",
              color: filter === s ? GOLD : SLATE,
              fontSize: "0.74rem", fontWeight: filter === s ? 700 : 400, cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
        <GhostBtn><Download size={13} strokeWidth={1.8} /> Exportar</GhostBtn>
      </div>

      <p style={{ fontSize: "0.72rem", color: SLATE_L, marginBottom: 12 }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        {globalQ ? ` para "${globalQ}"` : ""}
      </p>

      <Card>
        <Table headers={["ID", "Cliente", "Obra", "Valor", "Estado", "Data", "Ações"]}>
          {paginated.map((o, i) => (
            <TR key={o.id} last={i === paginated.length - 1}>
              <TD><span style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 700 }}>{o.id}</span></TD>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initials={o.initials} size={28} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 500, color: CHARCOAL }}>{o.client}</span>
                </div>
              </TD>
              <TD><span style={{ fontSize: "0.78rem", color: SLATE }}>{o.obra}</span></TD>
              <TD><span style={{ fontSize: "0.82rem", fontWeight: 700, color: CHARCOAL }}>{o.value}</span></TD>
              <TD><Badge s={o.status as ST} /></TD>
              <TD><span style={{ fontSize: "0.73rem", color: SLATE_L }}>{o.date}</span></TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #E2E8F0", background: "#FFF", cursor: "pointer", color: SLATE, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 3 }}>
                    <Eye size={11} strokeWidth={2} /> Ver
                  </button>
                  <button style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #E2E8F0", background: "#FFF", cursor: "pointer", color: SLATE, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 3 }}>
                    <Edit2 size={11} strokeWidth={2} /> Editar
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
        {paginated.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: SLATE_L }}>Nenhuma encomenda encontrada.</p>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 16 }}>
          <span style={{ fontSize: "0.72rem", color: SLATE_L, marginRight: 4 }}>
            Pág. {page} de {totalPages}
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: p === page ? `1.5px solid ${GOLD}` : "1px solid #E2E8F0",
              background: p === page ? `${GOLD}15` : "#FFF",
              color: p === page ? GOLD : SLATE,
              fontSize: "0.78rem", fontWeight: p === page ? 700 : 400, cursor: "pointer",
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Clientes ───────────────────────────────────────���──────────────────────────

function ClientesScreen({ globalQ }: { globalQ: string }) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [clientes, setClientes] = useState(CLIENTES);

  const filtered = clientes.filter(c =>
    !globalQ ||
    c.name.toLowerCase().includes(globalQ.toLowerCase()) ||
    c.email.toLowerCase().includes(globalQ.toLowerCase()) ||
    c.location.toLowerCase().includes(globalQ.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total de Clientes", value: `${clientes.length}`, accent: "#3B82F6", bg: "#EFF6FF", icon: Users },
          { label: "Ativos este mês",   value: `${clientes.filter(c => c.status === "Ativo").length}`, accent: "#10B981", bg: "#ECFDF5", icon: TrendingUp },
          { label: "Receita média",      value: "€ 41",  accent: GOLD,      bg: "#FFFBF0", icon: CreditCard },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} strokeWidth={1.8} color={c.accent} />
              </div>
              <div>
                <div style={{ fontSize: "1.55rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.03em", lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: "0.72rem", color: SLATE, marginTop: 3 }}>{c.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {globalQ && (
        <p style={{ fontSize: "0.72rem", color: SLATE_L, marginBottom: 12 }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "{globalQ}"
        </p>
      )}

      <Card>
        <CardHeader title="Lista de Clientes" action={<GhostBtn><Filter size={12} strokeWidth={2} /> Filtrar</GhostBtn>} />
        <Table headers={["Cliente", "Email", "Localidade", "Membro desde", "Encomendas", "Total", "Estado", "Ações"]}>
          {filtered.map((c, i) => (
            <TR key={c.id} last={i === filtered.length - 1}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Avatar initials={c.initials} size={30} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: CHARCOAL }}>{c.name}</span>
                </div>
              </TD>
              <TD><span style={{ fontSize: "0.76rem", color: SLATE }}>{c.email}</span></TD>
              <TD><span style={{ fontSize: "0.78rem", color: SLATE_L }}>{c.location}</span></TD>
              <TD><span style={{ fontSize: "0.75rem", color: SLATE_L }}>{c.joined}</span></TD>
              <TD><span style={{ fontSize: "0.82rem", fontWeight: 600, color: CHARCOAL, textAlign: "center", display: "block" }}>{c.orders}</span></TD>
              <TD><span style={{ fontSize: "0.82rem", fontWeight: 700, color: CHARCOAL }}>{c.total}</span></TD>
              <TD><Badge s={c.status as ST} /></TD>
              <TD>
                <button onClick={() => setDeleteId(c.id)} style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #FEE2E2", background: "#FFF5F5", cursor: "pointer", color: "#DC2626", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 3 }}>
                  <Trash2 size={11} strokeWidth={2} /> Apagar
                </button>
              </TD>
            </TR>
          ))}
        </Table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: SLATE_L }}>Nenhum cliente encontrado.</p>
          </div>
        )}
      </Card>

      {deleteId !== null && (
        <DeleteModal
          title="Remover cliente?"
          desc="O registo do cliente será apagado permanentemente."
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { setClientes(p => p.filter(c => c.id !== deleteId)); setDeleteId(null); }}
        />
      )}
    </div>
  );
}

// ── Newsletter ────────────────────────────────────────────────────────────────

function NewsletterScreen() {
  const [subs, setSubs] = useState(NEWSLETTER_SUBS);
  const [sent, setSent] = useState(false);
  const active = subs.filter(s => s.active).length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,320px)", gap: 18 }}>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total Subscritores",  value: subs.length, accent: "#3B82F6", bg: "#EFF6FF", icon: Users },
              { label: "Subscritores Ativos", value: active,      accent: "#10B981", bg: "#ECFDF5", icon: Check },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <Card key={i} style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} strokeWidth={1.8} color={c.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.02em", lineHeight: 1 }}>{c.value}</div>
                    <div style={{ fontSize: "0.7rem", color: SLATE, marginTop: 2 }}>{c.label}</div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader title="Subscritores" />
            <Table headers={["Nome", "Email", "Data", "Ativo"]}>
              {subs.map((s, i) => (
                <TR key={s.id} last={i === subs.length - 1}>
                  <TD><span style={{ fontSize: "0.82rem", fontWeight: 500, color: CHARCOAL }}>{s.name}</span></TD>
                  <TD><span style={{ fontSize: "0.76rem", color: SLATE }}>{s.email}</span></TD>
                  <TD><span style={{ fontSize: "0.72rem", color: SLATE_L }}>{s.joined}</span></TD>
                  <TD>
                    <Toggle
                      on={s.active}
                      onChange={() => setSubs(p => p.map(x => x.id === s.id ? { ...x, active: !x.active } : x))}
                    />
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>

        {/* Compose panel */}
        <Card style={{ padding: "22px", height: "fit-content" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${GOLD}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={15} color={GOLD} strokeWidth={1.8} />
            </div>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: CHARCOAL }}>Enviar Newsletter</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: "0.65rem", color: SLATE, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Assunto</label>
              <input defaultValue="Novas obras de Março | Atelier Ana Alexandre" style={{
                width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
                borderRadius: 10, fontSize: "0.82rem", color: CHARCOAL, background: PAGE_BG,
                outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
              }} />
            </div>

            <div>
              <label style={{ fontSize: "0.65rem", color: SLATE, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Destinatários</label>
              <select style={{
                width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
                borderRadius: 10, fontSize: "0.82rem", color: CHARCOAL, background: PAGE_BG,
                outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
              }}>
                <option>Todos os ativos ({active})</option>
                <option>Clientes com compras</option>
                <option>Novos subscritores</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.65rem", color: SLATE, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Mensagem</label>
              <textarea rows={6} defaultValue={`Cara comunidade,\n\nTemos o prazer de apresentar as mais recentes obras do atelier, criadas neste início de primavera…`} style={{
                width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
                borderRadius: 10, fontSize: "0.82rem", color: CHARCOAL, background: PAGE_BG,
                outline: "none", fontFamily: "'Inter', sans-serif",
                resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <GhostBtn><Eye size={13} strokeWidth={1.8} /> Pré-visualizar</GhostBtn>
              <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000); }} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 14px", borderRadius: 10, border: "none",
                background: sent ? "#10B981" : `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
                color: sent ? "#FFFFFF" : "#1A1A1A",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                transition: "background 0.3s, color 0.3s",
              }}>
                {sent ? <><Check size={13} /> Enviado!</> : <><Send size={13} strokeWidth={2} /> Enviar</>}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Definições ────────────────────────────────────────────────────────────────

// Initial notification preferences (fixed: no useState inside map)
const NOTIF_PREFS_INIT = [
  { id: 1, label: "Nova encomenda recebida",       desc: "Email quando uma nova encomenda é criada",  on: true  },
  { id: 2, label: "Novo subscritor de newsletter", desc: "Notificação para novos subscritores",        on: true  },
  { id: 3, label: "Mensagem de contacto",          desc: "Alerta quando uma mensagem é recebida",     on: true  },
  { id: 4, label: "Resumo semanal",                desc: "Relatório semanal de vendas e atividade",   on: false },
];

function DefinicoesScreen() {
  const [saved, setSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(NOTIF_PREFS_INIT);
  const [activeTab, setActiveTab] = useState<"atelier"|"seguranca"|"notif">("atelier");

  const toggleNotif = (id: number) =>
    setNotifPrefs(p => p.map(n => n.id === id ? { ...n, on: !n.on } : n));

  const inputCss: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0",
    borderRadius: 10, fontSize: "0.85rem", color: CHARCOAL, background: PAGE_BG,
    outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  };

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ fontSize: "0.65rem", color: SLATE, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {children}
    </label>
  );

  const tabs: { id: "atelier"|"seguranca"|"notif"; label: string; icon: React.ElementType }[] = [
    { id: "atelier",   label: "Atelier",      icon: Globe },
    { id: "seguranca", label: "Segurança",     icon: Lock  },
    { id: "notif",     label: "Notificações",  icon: Bell  },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      {/* Tab nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: PAGE_BG, padding: 4, borderRadius: 12, width: "fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 9, border: "none",
              background: isActive ? "#FFFFFF" : "transparent",
              color: isActive ? CHARCOAL : SLATE,
              fontSize: "0.8rem", fontWeight: isActive ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
              <Icon size={14} strokeWidth={isActive ? 2 : 1.6} color={isActive ? GOLD : SLATE} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "atelier" && (
        <Card style={{ padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GOLD}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={17} color={GOLD} strokeWidth={1.8} />
            </div>
            <div>
              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: CHARCOAL, display: "block" }}>Informações do Atelier</span>
              <span style={{ fontSize: "0.72rem", color: SLATE_L }}>Dados públicos e de contacto</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><FieldLabel>Nome do Atelier</FieldLabel><input defaultValue="Atelier Ana Alexandre" style={inputCss} /></div>
            <div><FieldLabel>Email de Contacto</FieldLabel><input defaultValue="atelier.anaalexandre@gmail.com" style={inputCss} /></div>
            <div><FieldLabel>Telefone</FieldLabel><input defaultValue="+351 912 345 678" style={inputCss} /></div>
            <div><FieldLabel>Localidade</FieldLabel><input defaultValue="Tomar, Portugal" style={inputCss} /></div>
            <div><FieldLabel>Website</FieldLabel><input defaultValue="https://atelier-anaalexandre.pt" style={inputCss} /></div>
            <div><FieldLabel>Instagram</FieldLabel><input defaultValue="@atelier.anaalexandre" style={inputCss} /></div>
            <div style={{ gridColumn: "1/-1" }}>
              <FieldLabel>Bio / Descrição</FieldLabel>
              <textarea rows={3} defaultValue="Espaço dedicado à arte contemporânea de autor. Pintura, escultura e instalação com raízes na tradição e alma no presente." style={{ ...inputCss, resize: "vertical", lineHeight: 1.6 }} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "seguranca" && (
        <Card style={{ padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={17} color="#3B82F6" strokeWidth={1.8} />
            </div>
            <div>
              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: CHARCOAL, display: "block" }}>Segurança da Conta</span>
              <span style={{ fontSize: "0.72rem", color: SLATE_L }}>Alterar credenciais de acesso</span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><FieldLabel>Email atual</FieldLabel><input defaultValue="atelier.anaalexandre@gmail.com" style={inputCss} /></div>
              <div><FieldLabel>Novo email</FieldLabel><input type="email" placeholder="novo@email.com" style={inputCss} /></div>
            </div>
            <div style={{ height: 1, background: "#EEF2F7" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div><FieldLabel>Password atual</FieldLabel><input type="password" defaultValue="••••••••" style={inputCss} /></div>
              <div><FieldLabel>Nova password</FieldLabel><input type="password" placeholder="Nova password" style={inputCss} /></div>
              <div><FieldLabel>Confirmar</FieldLabel><input type="password" placeholder="Confirmar" style={inputCss} /></div>
            </div>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px", borderRadius: 10,
              background: "#FFFBF0", border: `1px solid ${GOLD}30`,
            }}>
              <AlertCircle size={16} color={GOLD} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: "0.76rem", color: "#92704A", lineHeight: 1.5, margin: 0 }}>
                Após alterar a password será necessário autenticar novamente em todos os dispositivos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "notif" && (
        <Card style={{ padding: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={17} color="#10B981" strokeWidth={1.8} />
            </div>
            <div>
              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: CHARCOAL, display: "block" }}>Preferências de Notificação</span>
              <span style={{ fontSize: "0.72rem", color: SLATE_L }}>Controla o que recebes e quando</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifPrefs.map(n => (
              <div key={n.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 12,
                background: n.on ? `${GOLD}08` : PAGE_BG,
                border: `1px solid ${n.on ? GOLD + "25" : "#E2E8F0"}`,
                transition: "all 0.2s",
              }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: CHARCOAL }}>{n.label}</div>
                  <div style={{ fontSize: "0.72rem", color: SLATE_L, marginTop: 2 }}>{n.desc}</div>
                </div>
                <Toggle on={n.on} onChange={() => toggleNotif(n.id)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Save bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <GhostBtn><RefreshCw size={13} strokeWidth={2} /> Repor</GhostBtn>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: saved ? "#10B981" : `linear-gradient(135deg, ${GOLD}, ${GOLD_L})`,
            color: saved ? "#FFFFFF" : "#1A1A1A",
            fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
            boxShadow: `0 2px 8px ${saved ? "#10B98140" : GOLD + "50"}`,
            transition: "background 0.3s, color 0.3s",
          }}>
          {saved ? <Check size={14} strokeWidth={2.5} /> : <Save size={14} strokeWidth={1.8} />}
          {saved ? "Guardado!" : "Guardar Alterações"}
        </button>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [screen, setScreen]       = useState<Screen>("inicio");
  const [sidebarOpen, setSidebar] = useState(false);
  const [globalQ, setGlobalQ]     = useState("");

  // Reset search when changing screen
  const handleSetScreen = (s: Screen) => {
    setScreen(s);
    setGlobalQ("");
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: PAGE_BG,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Sidebar
        active={screen}
        setActive={handleSetScreen}
        open={sidebarOpen}
        onClose={() => setSidebar(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          screen={screen}
          q={globalQ}
          setQ={setGlobalQ}
          onMenuClick={() => setSidebar(true)}
        />
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {screen === "inicio"     && <DashboardHome />}
          {screen === "obras"      && <ObrasSection globalSearch={globalQ} />}
          {screen === "encomendas" && <VendasSection />}
          {screen === "clientes"   && <MensagensSection />}
          {screen === "newsletter" && <MensagensSection />}
          {screen === "definicoes" && <ConteudoSection />}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
