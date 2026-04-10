/**
 * Utilitário de email client-side.
 * Delega para a Supabase Edge Function `send-email` para nunca expor
 * a RESEND_API_KEY no bundle do browser.
 *
 * Requer:
 *   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local
 *   RESEND_API_KEY configurado nos Supabase secrets
 *   npx supabase functions deploy send-email
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SendOrderEmailParams {
  to: string;
  customerName: string;
  total: number;
  items: Array<{ titulo: string; preco: number }>;
}

/**
 * Envia confirmação de encomenda por Transferência Bancária.
 * (Para pagamentos Stripe, o email é enviado pelo webhook stripe-webhook.)
 */
export async function sendTransferOrderEmail(
  params: SendOrderEmailParams
): Promise<void> {
  await callSendEmail({
    to: params.to,
    subject: "Pedido recebido — Ana Alexandre Atelier",
    customerName: params.customerName,
    type: "transfer_order",
    data: {
      total: params.total,
      items: params.items,
    },
  });
}

// ── Interno ────────────────────────────────────────────────────────────────

async function callSendEmail(payload: {
  to: string;
  subject: string;
  customerName: string;
  type: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (import.meta.env?.DEV) console.warn("[email] Falha ao enviar email:", errorText);
  }
}
