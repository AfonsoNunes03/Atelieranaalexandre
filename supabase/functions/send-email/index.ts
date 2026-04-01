// Supabase Edge Function — Envio de email genérico via Resend
// Deploy: npx supabase functions deploy send-email
// Set secrets: npx supabase secrets set RESEND_API_KEY=re_...
//
// Usado para:
//   - Confirmação de encomenda por Transferência Bancária
//   - Outras notificações client-triggered

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  /** Nome do cliente — usado no corpo do email */
  customerName: string;
  /** Tipo de email a enviar */
  type: "transfer_order" | "contact_confirmation";
  /** Dados extras consoante o tipo */
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail =
      Deno.env.get("NOTIFY_EMAIL") ?? "atelier.anaalexandre@gmail.com";

    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.type) {
      return new Response(
        JSON.stringify({ error: "to and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let html = "";
    let subject = payload.subject;

    if (payload.type === "transfer_order") {
      const total = (payload.data?.total as number) ?? 0;
      const items = (payload.data?.items as Array<{ titulo: string; preco: number }>) ?? [];
      html = buildTransferOrderHtml(payload.customerName, total, items, notifyEmail);
      subject = subject || "Pedido recebido — Ana Alexandre Atelier";
    } else if (payload.type === "contact_confirmation") {
      html = buildContactConfirmationHtml(payload.customerName);
      subject = subject || "Mensagem recebida — Ana Alexandre Atelier";
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
        to: [payload.to],
        bcc: [notifyEmail],
        reply_to: notifyEmail,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Templates HTML ──────────────────────────────────────────────────────────

function buildTransferOrderHtml(
  name: string,
  total: number,
  items: Array<{ titulo: string; preco: number }>,
  atelierEmail: string
): string {
  const totalFmt = total.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#1a1a1a;font-size:13px;border-bottom:1px solid #f0ede8">
          ${escHtml(i.titulo)}
        </td>
        <td style="padding:8px 0;color:#C4956A;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8">
          €${i.preco.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">Ana Alexandre · Atelier</p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0">Pedido recebido 🎨</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 24px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        Recebemos o teu pedido por Transferência Bancária. Segue em baixo o resumo.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#1a1a1a">Total</td>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#C4956A;text-align:right">€${totalFmt}</td>
        </tr>
      </table>

      <div style="background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A;padding:16px 20px;margin-bottom:24px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px">Dados para Transferência</p>
        <p style="color:#1a1a1a;font-size:13px;line-height:1.8;margin:0">
          <strong>IBAN:</strong> PT50 0000 0000 0000 0000 0000 0<br>
          <strong>Titular:</strong> Ana Alexandre<br>
          <strong>Referência:</strong> ARTE-${Date.now().toString(36).toUpperCase()}
        </p>
      </div>

      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Após confirmarmos o pagamento, entraremos em contacto para tratar do envio da obra.
        Qualquer dúvida, responde a este email ou contacta-nos em
        <a href="mailto:${escHtml(atelierEmail)}" style="color:#C4956A">${escHtml(atelierEmail)}</a>.
      </p>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0">Ana Alexandre · Atelier de Arte · Tomar, Portugal</p>
    </div>
  </div>
</body>
</html>`;
}

function buildContactConfirmationHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">Ana Alexandre · Atelier</p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0">Mensagem recebida ✓</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 16px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        Obrigada pela tua mensagem. Responderei o mais brevemente possível.
      </p>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Habitualmente respondo em 24–48 horas úteis.
      </p>
      <a href="https://ana-alexandre.pt"
        style="display:inline-block;padding:12px 28px;background:#C4956A;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
        Visitar Atelier
      </a>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0">Ana Alexandre · Atelier de Arte · Tomar, Portugal</p>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
