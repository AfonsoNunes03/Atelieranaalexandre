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

export interface CheckoutItem {
  id: string;
  titulo: string;
  preco: number;
  imagem_url?: string;
}

/**
 * Chama a Supabase Edge Function `create-checkout-session`,
 * obtém o URL de pagamento do Stripe e redireciona o utilizador.
 *
 * Requer:
 *   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local
 *   STRIPE_SECRET_KEY configurado nos Supabase secrets
 */
export async function createStripeCheckoutSession(
  items: CheckoutItem[],
  customerEmail: string,
  vendaId: string | null
): Promise<void> {
  const edgeFnUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;

  const res = await fetch(edgeFnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ items, customerEmail, vendaId }),
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
