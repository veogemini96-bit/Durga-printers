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
    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const env = Deno.env.get("CASHFREE_ENV") || "TEST";

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({ error: "Cashfree not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isProduction = !/^(test|sandbox)/i.test(env);
    const baseUrl = isProduction
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    // Support GET (redirect callback) and POST (webhook/server callback)
    let cfOrderId: string | null = null;
    let internalOrderId: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      cfOrderId = url.searchParams.get("cf_order_id") || url.searchParams.get("order_id");
      internalOrderId = url.searchParams.get("internal_order_id");
    } else {
      const body = await req.json();
      // Cashfree webhook payload has data.order.order_id
      cfOrderId = body.data?.order?.order_id || body.cf_order_id || body.order_id;
      internalOrderId = body.data?.order?.order_tags?.internal_order_id || body.internal_order_id;
    }

    if (!cfOrderId) {
      return new Response(
        JSON.stringify({ error: "cf_order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order status from Cashfree
    const statusRes = await fetch(`${baseUrl}/orders/${cfOrderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
    });

    const orderData = await statusRes.json();

    if (!statusRes.ok) {
      console.error("Cashfree fetch order error:", orderData);
      return new Response(
        JSON.stringify({ error: orderData.message || "Failed to fetch order status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cashfree order_status values: ACTIVE, PAID, EXPIRED, CANCELLED, TERMINATING, VOID
    const cfStatus = orderData.order_status;
    const isPaid = cfStatus === "PAID";
    const paymentStatus = isPaid ? "paid" : cfStatus === "EXPIRED" || cfStatus === "CANCELLED" ? "failed" : "pending";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    // Update payment record
    await db
      .from("payments")
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", cfOrderId);

    // Resolve internal order ID — from URL param or order_tags
    if (!internalOrderId) {
      internalOrderId =
        orderData.order_tags?.internal_order_id || null;
    }

    // Fallback: find via payments table
    if (!internalOrderId) {
      const { data: payment } = await db
        .from("payments")
        .select("order_id")
        .eq("transaction_id", cfOrderId)
        .maybeSingle();
      if (payment?.order_id) internalOrderId = payment.order_id;
    }

    if (internalOrderId) {
      await db
        .from("orders")
        .update({
          payment_status: paymentStatus,
          status: isPaid ? "confirmed" : "pending",
        })
        .eq("id", internalOrderId);

      if (isPaid) {
        // Fire confirmation email (non-blocking but logged)
        fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({ order_id: internalOrderId, customer_only: true }),
        }).then(async (r) => {
          if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            console.error("Webhook: send-order-confirmation failed:", d.error || r.status);
          }
        }).catch((e) => console.error("Webhook: send-order-confirmation error:", e));
      }
    }

    // For GET redirects from payment page, redirect browser to order success page
    if (req.method === "GET" && internalOrderId) {
      const siteUrl = Deno.env.get("SITE_URL") || "https://durgaprintstudio.com";
      const destination = `${siteUrl}/order-success/${internalOrderId}?verify=cashfree&status=${cfStatus.toLowerCase()}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: destination },
      });
    }

    return new Response(
      JSON.stringify({
        success: isPaid,
        cf_status: cfStatus,
        payment_status: paymentStatus,
        order_id: internalOrderId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("verify-cashfree-payment error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
