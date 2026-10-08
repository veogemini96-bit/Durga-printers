import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      order_id,
      amount,
      customer_name,
      customer_phone,
      customer_email,
      redirect_url,
    } = await req.json();

    if (!order_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "order_id and amount are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const env = Deno.env.get("CASHFREE_ENV") || "TEST";

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({
          error: "Cashfree not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Treat as production unless explicitly TEST/sandbox; accepts api.cashfree.com,
    // payments.cashfree.com, PRODUCTION, etc.
    const isProduction = !/^(test|sandbox)/i.test(env);
    const baseUrl = isProduction
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    // Cashfree order_id: max 50 chars, alphanumeric/hyphen/underscore
    const cfOrderId = `CF_${order_id.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`.slice(0, 50);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // return_url must contain {order_id} — Cashfree replaces it with cf order_id
    const returnUrl = redirect_url
      ? `${redirect_url}&cf_order_id={order_id}&internal_order_id=${order_id}`
      : `${supabaseUrl}/functions/v1/verify-phonepe-payment?internal_order_id=${order_id}&cf_order_id={order_id}`;

    const orderPayload = {
      order_id: cfOrderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${order_id.replace(/[^a-zA-Z0-9]/g, "_")}`,
        customer_name: customer_name || "Customer",
        customer_email: customer_email || "noreply@durgaprintstudio.com",
        customer_phone: (customer_phone || "9999999999").replace(/\D/g, "").slice(-10) || "9999999999",
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${supabaseUrl}/functions/v1/verify-phonepe-payment`,
      },
      order_note: `Order ${order_id}`,
      order_tags: {
        internal_order_id: order_id,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify(orderPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Cashfree create order error:", result);
      return new Response(
        JSON.stringify({
          error: result.message || "Failed to create Cashfree order",
          type: result.type,
          code: result.code,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the Cashfree order ID in payments table for later verification
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    await db.from("payments").insert({
      order_id,
      payment_gateway: "cashfree",
      amount: parseFloat(amount.toFixed(2)),
      currency: "INR",
      status: "pending",
      transaction_id: cfOrderId,
    });

    // Cashfree returns payment_session_id used for the hosted checkout redirect
    const paymentSessionId = result.payment_session_id;

    const paymentPageUrl = isProduction
      ? `https://payments.cashfree.com/pg/pay/${cfOrderId}?session_id=${paymentSessionId}`
      : `https://sandbox.cashfree.com/pg/pay/${cfOrderId}?session_id=${paymentSessionId}`;

    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: paymentPageUrl,
        cf_order_id: cfOrderId,
        payment_session_id: paymentSessionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("initiate-cashfree-payment error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
