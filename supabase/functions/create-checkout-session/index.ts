// Supabase Edge Function — Stripe Checkout Session
// Deploy: npx supabase functions deploy create-checkout-session
// Set secrets:
//   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   npx supabase secrets set SITE_URL=https://ana-alexandre.pt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const ALLOWED_ORIGINS = ["https://atelieranaalexandre.pt", "http://localhost:5173"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface CartItem {
  id: string;
  titulo: string;
  preco: number;
  imagem_url?: string;
}

interface RequestBody {
  items: CartItem[];
  customerEmail: string;
  vendaId: string | null;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://atelieranaalexandre.pt";

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const body: RequestBody = await req.json();
    const { items, customerEmail, vendaId } = body;

    if (!items?.length || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "items and customerEmail are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.titulo,
          ...(item.imagem_url ? { images: [item.imagem_url] } : {}),
        },
        unit_amount: Math.round(item.preco * 100), // Stripe usa cêntimos
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${siteUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: {
        venda_id: vendaId ?? "",
      },
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["PT", "ES", "FR", "DE", "IT", "GB", "NL", "BE"],
      },
      locale: "pt",
      payment_intent_data: {
        description: `Ana Alexandre Atelier — ${items.map((i) => i.titulo).join(", ")}`,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
