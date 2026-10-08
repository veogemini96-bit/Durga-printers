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
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "items array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const errors: string[] = [];

    for (const item of items) {
      const { product_id, qty } = item;
      if (!product_id || !qty || qty < 1) {
        errors.push(`Invalid item: ${JSON.stringify(item)}`);
        continue;
      }

      const { error } = await supabase.rpc("decrement_stock", {
        product_id,
        qty,
      });

      if (error) {
        errors.push(`Failed to decrement stock for ${product_id}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("decrement-stock error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
