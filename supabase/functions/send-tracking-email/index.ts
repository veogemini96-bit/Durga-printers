import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function createTransport() {
  return nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST") || "email-smtp.ap-south-1.amazonaws.com",
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    secure: false,
    auth: {
      user: Deno.env.get("SMTP_USERNAME"),
      pass: Deno.env.get("SMTP_PASSWORD"),
    },
  });
}

async function sendEmail(to: string, from: string, subject: string, html: string) {
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, html });
}

function buildTrackingEmail(order: any, trackingNumber: string): string {
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const addr = order.shipping_address;
  const addressLines = [addr.line1, addr.line2, `${addr.city}, ${addr.state} - ${addr.pincode}`]
    .filter(Boolean)
    .join("<br>");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #03238C 0%, #0a3db5 100%); padding: 36px 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Durga Print Studio</h1>
          <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">Premium Printing Solutions</p>
        </td></tr>

        <!-- Shipped Banner -->
        <tr><td style="background: linear-gradient(90deg, #f97316 0%, #ea580c 100%); padding: 22px 40px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Your Order is on its Way!</p>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">We've dispatched your order and it's heading to you.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">

          <p style="color: #333; font-size: 16px; margin: 0 0 28px;">Hi <strong>${order.customer_name}</strong>,</p>

          <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            Great news! Your order <strong style="color: #03238C;">${order.order_number}</strong> has been dispatched.
            You can use the tracking ID below to follow your shipment.
          </p>

          <!-- Tracking ID highlight -->
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="color: #1e40af; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Tracking ID</p>
            <p style="color: #1e3a8a; font-size: 28px; font-weight: 800; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">${trackingNumber}</p>
            <p style="color: #3b82f6; font-size: 12px; margin: 10px 0 0;">Use this ID to track your shipment with the courier.</p>
          </div>

          <!-- Order meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 10px; padding: 4px; margin-bottom: 32px;">
            <tr>
              <td style="padding: 10px 16px; color: #666; font-size: 13px; width: 140px;">Order Number</td>
              <td style="padding: 10px 16px; color: #03238C; font-size: 14px; font-weight: 700;">${order.order_number}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #666; font-size: 13px;">Order Date</td>
              <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px; font-weight: 600;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #666; font-size: 13px;">Order Total</td>
              <td style="padding: 10px 16px; color: #1a1a1a; font-size: 14px; font-weight: 700;">${formatCurrency(order.total)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #666; font-size: 13px;">Status</td>
              <td style="padding: 10px 16px;">
                <span style="background: #fff7ed; color: #c2410c; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px; border: 1px solid #fed7aa;">Shipped</span>
              </td>
            </tr>
          </table>

          <!-- Delivery address -->
          <h3 style="color: #1a1a1a; font-size: 15px; margin: 0 0 12px; font-weight: 700;">Delivering To</h3>
          <div style="background: #f8f9fa; border-radius: 10px; padding: 16px 20px; margin-bottom: 32px; color: #333; font-size: 14px; line-height: 1.9;">
            <strong>${order.customer_name}</strong><br>
            ${addressLines}<br>
            ${order.customer_phone}
          </div>

          <!-- Help -->
          <div style="border-top: 1px solid #f0f0f0; padding-top: 24px; text-align: center; color: #777; font-size: 13px; line-height: 1.8;">
            <p style="margin: 0 0 6px;">Need help with your order?</p>
            <p style="margin: 0;">Email us at <a href="mailto:support@durgaprintstudio.com" style="color: #03238C; font-weight: 600;">support@durgaprintstudio.com</a></p>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding: 24px; text-align: center; color: #aaa; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Durga Print Studio. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { order_id, tracking_number } = await req.json();

    if (!order_id || !tracking_number) {
      return new Response(
        JSON.stringify({ error: "order_id and tracking_number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await db
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const fromEmail = Deno.env.get("SMTP_FROM") || "orders@durgaprintstudio.com";

    if (!smtpUsername || !smtpPassword) {
      return new Response(
        JSON.stringify({ error: "Email not configured. Set SMTP_USERNAME and SMTP_PASSWORD secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subject = `Your Order ${order.order_number} Has Been Shipped — Tracking ID Inside`;
    await sendEmail(order.customer_email, fromEmail, subject, buildTrackingEmail(order, tracking_number));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-tracking-email error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
