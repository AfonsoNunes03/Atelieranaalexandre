// Supabase Edge Function — Stripe Checkout Session
// Deploy: npx supabase functions deploy create-checkout-session
// Set secrets:
//   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   npx supabase secrets set SITE_URL=https://ana-alexandre.pt
//   npx supabase secrets set SUPABASE_URL=...
//   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://atelieranaalexandre.pt", "http://localhost:5173", "http://localhost:4173"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface RequestBody {
  itemIds: string[];
  customerEmail: string;
  customerName: string;
  customerTelefone?: string;
  customerMorada?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://atelieranaalexandre.pt";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta. Faltam secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: RequestBody = await req.json();
    
    // Tratamento de payload legados caso o frontend envie checkout completo ainda
    const itemIds = body.itemIds || (body as any).items?.map((i: any) => i.id);
    const customerEmail = body.customerEmail;
    
    if (!itemIds?.length || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "Faltam items ou email do cliente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Obter os items REAIS da base de dados e validar
    const { data: obras, error: dbError } = await supabase
      .from("obras")
      .select("id, titulo, preco, estado, imagem_url")
      .in("id", itemIds);

    if (dbError || !obras || obras.length !== itemIds.length) {
      return new Response(
        JSON.stringify({ error: "Obras inválidas ou não encontradas na base de dados." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const indisponiveis = obras.filter((o) => o.estado !== "disponivel");
    if (indisponiveis.length > 0) {
      return new Response(
        JSON.stringify({ error: `A obra "${indisponiveis[0].titulo}" já não está disponível.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calcular o total real
    const total = obras.reduce((acc, curr) => acc + (curr.preco ?? 0), 0);
    const orderItems = obras.map(o => ({ id: o.id, titulo: o.titulo, preco: o.preco }));

    // 2. Criar Venda no Supabase primeiro como 'pendente' (Auth Bypass porque estamos com Service Role)
    const { data: novaVenda, error: insertError } = await supabase
      .from("vendas")
      .insert({
        cliente_nome: body.customerName || "Cliente",
        cliente_email: customerEmail,
        cliente_tel: body.customerTelefone || null,
        morada: body.customerMorada || null,
        total,
        items: orderItems,
        estado: "pendente",
      })
      .select("id")
      .single();

    if (insertError || !novaVenda) {
      return new Response(
        JSON.stringify({ error: "Erro ao registar venda no sistema." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Gerar Sessão de Stripe
    const lineItems = obras.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.titulo,
          ...(item.imagem_url ? { images: [item.imagem_url] } : {}),
        },
        unit_amount: Math.round((item.preco ?? 0) * 100),
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
        venda_id: novaVenda.id,
      },
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["PT", "ES", "FR", "DE", "IT", "GB", "NL", "BE"],
      },
      locale: "pt",
      payment_intent_data: {
        description: `Ana Alexandre Atelier — ${obras.map((i) => i.titulo).join(", ")}`,
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
