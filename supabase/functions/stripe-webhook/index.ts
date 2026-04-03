// Supabase Edge Function — Stripe Webhook Handler
// Deploy: npx supabase functions deploy stripe-webhook
// Configure no Stripe Dashboard: https://dashboard.stripe.com/webhooks
//   → Endpoint URL: https://<project>.supabase.co/functions/v1/stripe-webhook
//   → Events: checkout.session.completed, payment_intent.payment_failed
//
// Set secrets:
//   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//   npx supabase secrets set RESEND_API_KEY=re_...
//   npx supabase secrets set NOTIFY_EMAIL=atelier.anaalexandre@gmail.com

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL") ?? "";

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", (err as Error).message);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const vendaId = session.metadata?.venda_id;
    const customerEmail =
      session.customer_email ?? session.customer_details?.email ?? null;
    const customerName = session.customer_details?.name ?? "Cliente";
    const amountPaid = (session.amount_total ?? 0) / 100;

    // 1. Atualizar estado da venda para 'pago' e buscar items
    if (vendaId) {
      const { data: vendaData, error } = await supabase
        .from("vendas")
        .update({
          estado: "pago",
          stripe_session_id: session.id,
        })
        .eq("id", vendaId)
        .select("items")
        .single();

      if (error) {
        console.error("[webhook] Erro a atualizar venda:", error.message);
      } else {
        // 2. Marcar obras como vendidas
        const itemIds: string[] = ((vendaData?.items ?? []) as Array<{ id: string }>).map(i => i.id);
        if (itemIds.length > 0) {
          const { error: obrasError } = await supabase
            .from("obras")
            .update({ estado: "vendido" })
            .in("id", itemIds);
          if (obrasError) console.error("[webhook] Erro a marcar obras:", obrasError.message);
        }
      }
    }

    // 2. Enviar recibo ao cliente + notificação ao atelier via Resend
    if (resendKey && customerEmail) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
          to: [customerEmail],
          bcc: [notifyEmail],
          reply_to: notifyEmail,
          subject: "Confirmação de pagamento — Ana Alexandre Atelier",
          html: buildReceiptHtml(customerName, amountPaid, session.id),
        }),
      });

      if (!emailRes.ok) {
        console.error("[webhook] Erro Resend:", await emailRes.text());
      }
    }
  }

  // ── checkout.session.expired ──────────────────────────────────────────────
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { data: venda } = await supabase
      .from("vendas")
      .select("id, items")
      .eq("stripe_session_id", session.id)
      .single();

    if (venda) {
      const itemIds: string[] = ((venda.items ?? []) as Array<{ id: string }>).map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from("obras").update({ estado: "disponivel" }).in("id", itemIds);
      }
      await supabase.from("vendas").update({ estado: "cancelado" }).eq("id", venda.id);
    }
  }

  // ── payment_intent.payment_failed ─────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn("[webhook] Pagamento falhou:", pi.id, pi.last_payment_error?.message);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ── HTML do recibo ─────────────────────────────────────────────────────────

function buildReceiptHtml(name: string, amount: number, sessionId: string): string {
  const amountFormatted = amount.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">
        Ana Alexandre · Atelier
      </p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0;line-height:1.3">
        Pagamento confirmado ✓
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 24px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        O teu pagamento de
        <strong style="color:#C4956A">€${amountFormatted}</strong>
        foi recebido com sucesso. Obrigada pela tua confiança!
      </p>

      <div style="background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A;padding:16px 20px;margin-bottom:24px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px">
          Referência da transação
        </p>
        <p style="color:#1a1a1a;font-size:12px;font-family:monospace;margin:0;word-break:break-all">
          ${escHtml(sessionId)}
        </p>
      </div>

      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Entraremos em contacto brevemente para confirmar os detalhes de envio da obra.
        Se tiveres alguma questão, responde a este email.
      </p>

      <a href="https://ana-alexandre.pt/galeria"
        style="display:inline-block;padding:12px 28px;background:#C4956A;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.05em">
        Ver Galeria
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6">
        Ana Alexandre · Atelier de Arte Contemporânea · Tomar, Portugal
      </p>
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
