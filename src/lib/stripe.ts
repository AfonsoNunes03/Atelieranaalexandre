import { loadStripe, Stripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

/**
 * Chama a Supabase Edge Function `create-checkout-session`,
 * obtém o URL de pagamento do Stripe e redireciona o utilizador.
 *
 * Requer:
 *   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local
 *   STRIPE_SECRET_KEY e SUPABASE_SERVICE_ROLE_KEY configurados nos Supabase secrets
 */
export async function createStripeCheckoutSession(
  itemIds: string[],
  customerInfo: {
    email: string;
    nome: string;
    telefone?: string;
    morada?: string;
  }
): Promise<void> {
  const edgeFnUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;

  const res = await fetch(edgeFnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ 
      items: itemIds, 
      customerEmail: customerInfo.email,
      customerName: customerInfo.nome,
      customerTelefone: customerInfo.telefone,
      customerMorada: customerInfo.morada 
    }),
  });

  if (!res.ok) {
    let errMsg = "Falha ao criar sessão de pagamento";
    try {
      const err = await res.json();
      errMsg = err.error ?? errMsg;
    } catch {
      /* ignore */
    }
    throw new Error(errMsg);
  }

  const { url } = await res.json();
  if (!url) throw new Error("URL de pagamento não recebido do servidor");

  // Redireciona para a página de checkout hospedada pelo Stripe
  window.location.href = url;
}
