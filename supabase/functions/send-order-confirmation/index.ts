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

function buildCustomerEmail(order: any, items: any[]): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #1a1a1a;">${item.product_name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">${formatCurrency(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  const addr = order.shipping_address;
  const addressLines = [addr.line1, addr.line2, `${addr.city}, ${addr.state} - ${addr.pincode}`]
    .filter(Boolean)
    .join("<br>");

  const paymentMethod = order.payment_method === "phonepe" ? "PhonePe / Online Payment" : "Cash on Delivery";

  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #03238C 0%, #0a3db5 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Durga Print Studio</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Premium Printing Solutions</p>
        </td></tr>

        <!-- Success Banner -->
        <tr><td style="background: #22c55e; padding: 20px 40px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">Order Confirmed!</p>
          <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 14px;">We've received your order and will start processing it soon.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">

          <p style="color: #333; font-size: 16px; margin: 0 0 24px;">Hi <strong>${order.customer_name}</strong>,</p>

          <!-- Order Meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <tr>
              <td style="padding: 6px 12px;">
                <span style="color: #666; font-size: 13px;">Order Number</span><br>
                <strong style="color: #03238C; font-size: 18px;">${order.order_number}</strong>
              </td>
              <td style="padding: 6px 12px; text-align: right;">
                <span style="color: #666; font-size: 13px;">Order Date</span><br>
                <strong style="color: #1a1a1a; font-size: 15px;">${orderDate}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;">
                <span style="color: #666; font-size: 13px;">Payment</span><br>
                <strong style="color: #1a1a1a; font-size: 15px;">${paymentMethod}</strong>
              </td>
              <td style="padding: 6px 12px; text-align: right;">
                <span style="color: #666; font-size: 13px;">Payment Status</span><br>
                <strong style="color: ${order.payment_status === "paid" ? "#22c55e" : "#f59e0b"}; font-size: 15px;">${order.payment_status === "paid" ? "Paid" : "Pending"}</strong>
              </td>
            </tr>
          </table>

          <!-- Items -->
          <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 16px; font-weight: 700;">Order Items</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; color: #666; font-size: 13px; font-weight: 600;">Product</th>
                <th style="padding: 12px; text-align: center; color: #666; font-size: 13px; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #666; font-size: 13px; font-weight: 600;">Price</th>
                <th style="padding: 12px; text-align: right; color: #666; font-size: 13px; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 14px;">Subtotal</td>
              <td style="padding: 6px 0; text-align: right; color: #666; font-size: 14px;">${formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 14px;">Tax (18%)</td>
              <td style="padding: 6px 0; text-align: right; color: #666; font-size: 14px;">${formatCurrency(order.tax)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; font-size: 14px;">Shipping</td>
              <td style="padding: 6px 0; text-align: right; color: ${order.shipping_fee === 0 ? "#22c55e" : "#666"}; font-size: 14px;">${order.shipping_fee === 0 ? "FREE" : formatCurrency(order.shipping_fee)}</td>
            </tr>
            ${order.discount > 0 ? `<tr>
              <td style="padding: 6px 0; color: #22c55e; font-size: 14px;">Discount</td>
              <td style="padding: 6px 0; text-align: right; color: #22c55e; font-size: 14px;">-${formatCurrency(order.discount)}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 12px 0 6px; border-top: 2px solid #f0f0f0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Total</td>
              <td style="padding: 12px 0 6px; border-top: 2px solid #f0f0f0; text-align: right; color: #03238C; font-size: 18px; font-weight: 700;">${formatCurrency(order.total)}</td>
            </tr>
          </table>

          <!-- Shipping Address -->
          <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 12px; font-weight: 700;">Shipping Address</h3>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 32px; color: #333; font-size: 14px; line-height: 1.8;">
            <strong>${order.customer_name}</strong><br>
            ${addressLines}<br>
            ${order.customer_phone}
          </div>

          <!-- Footer note -->
          <div style="border-top: 1px solid #f0f0f0; padding-top: 24px; text-align: center; color: #666; font-size: 13px; line-height: 1.8;">
            <p style="margin: 0 0 8px;">Questions about your order?</p>
            <p style="margin: 0;">Email us at <a href="mailto:support@durgaprintstudio.com" style="color: #03238C;">support@durgaprintstudio.com</a></p>
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

function buildAdminEmail(order: any, items: any[]): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #1a1a1a;">${item.product_name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">${formatCurrency(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  const addr = order.shipping_address;
  const addressText = [addr.line1, addr.line2, `${addr.city}, ${addr.state} - ${addr.pincode}`]
    .filter(Boolean)
    .join(", ");

  const paymentLabel = order.payment_method === "phonepe" ? "PhonePe / Online Payment" : "Cash on Delivery";

  const orderDate = new Date(order.created_at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

        <!-- Header -->
        <tr><td style="background: #1a1a2e; padding: 28px 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Durga Print Studio — Admin Alert</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">New order received on ${orderDate}</p>
        </td></tr>

        <!-- Alert Banner -->
        <tr><td style="background: #f59e0b; padding: 16px 40px; text-align: center;">
          <p style="color: #1a1a1a; margin: 0; font-size: 20px; font-weight: 700;">New Order: ${order.order_number}</p>
          <p style="color: rgba(0,0,0,0.7); margin: 4px 0 0; font-size: 14px;">Total: ${formatCurrency(order.total)} &nbsp;|&nbsp; ${paymentLabel}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background: #ffffff; padding: 36px 40px; border-radius: 0 0 12px 12px;">

          <!-- Customer Details -->
          <h3 style="color: #1a1a1a; font-size: 15px; margin: 0 0 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; padding: 4px; margin-bottom: 28px;">
            <tr>
              <td style="padding: 10px 14px; color: #666; font-size: 13px; width: 130px;">Name</td>
              <td style="padding: 10px 14px; color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #666; font-size: 13px;">Email</td>
              <td style="padding: 10px 14px; font-size: 14px;"><a href="mailto:${order.customer_email}" style="color: #03238C;">${order.customer_email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #666; font-size: 13px;">Phone</td>
              <td style="padding: 10px 14px; font-size: 14px;"><a href="tel:${order.customer_phone}" style="color: #03238C;">${order.customer_phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #666; font-size: 13px;">Address</td>
              <td style="padding: 10px 14px; color: #1a1a1a; font-size: 14px;">${addressText}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; color: #666; font-size: 13px;">Payment</td>
              <td style="padding: 10px 14px; color: ${order.payment_status === "paid" ? "#22c55e" : "#f59e0b"}; font-size: 14px; font-weight: 600;">${paymentLabel} — ${order.payment_status === "paid" ? "PAID" : "PENDING"}</td>
            </tr>
          </table>

          <!-- Items -->
          <h3 style="color: #1a1a1a; font-size: 15px; margin: 0 0 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px 12px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Product</th>
                <th style="padding: 10px 12px; text-align: center; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Unit</th>
                <th style="padding: 10px 12px; text-align: right; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Grand Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Subtotal</td><td style="padding: 6px 0; text-align: right; color: #666; font-size: 14px;">${formatCurrency(order.subtotal)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Tax (18%)</td><td style="padding: 6px 0; text-align: right; color: #666; font-size: 14px;">${formatCurrency(order.tax)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Shipping</td><td style="padding: 6px 0; text-align: right; color: ${order.shipping_fee === 0 ? "#22c55e" : "#666"}; font-size: 14px;">${order.shipping_fee === 0 ? "FREE" : formatCurrency(order.shipping_fee)}</td></tr>
            ${order.discount > 0 ? `<tr><td style="padding: 6px 0; color: #22c55e; font-size: 14px;">Discount</td><td style="padding: 6px 0; text-align: right; color: #22c55e; font-size: 14px;">-${formatCurrency(order.discount)}</td></tr>` : ""}
            <tr><td style="padding: 12px 0 0; border-top: 2px solid #f0f0f0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Grand Total</td><td style="padding: 12px 0 0; border-top: 2px solid #f0f0f0; text-align: right; color: #03238C; font-size: 18px; font-weight: 700;">${formatCurrency(order.total)}</td></tr>
          </table>

          <div style="text-align: center;">
            <p style="color: #666; font-size: 13px; margin: 0;">Log in to the admin panel to manage this order.</p>
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
    const { order_id, admin_only, customer_only } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase
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

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    if (itemsError) throw itemsError;

    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const fromEmail = Deno.env.get("SMTP_FROM") || "order@durgaprintstudio.com";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "durgaprints.orders@gmail.com";

    if (!smtpUsername || !smtpPassword) {
      return new Response(
        JSON.stringify({ error: "Email not configured. Set SMTP_USERNAME and SMTP_PASSWORD secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSubject = `New Order ${order.order_number} — ${formatCurrency(order.total)}`;
    const sendAdmin = sendEmail(adminEmail, fromEmail, adminSubject, buildAdminEmail(order, items || []));

    if (admin_only) {
      await sendAdmin;
    } else if (customer_only) {
      const customerSubject = `Order Confirmed: ${order.order_number} — Durga Print Studio`;
      await sendEmail(order.customer_email, fromEmail, customerSubject, buildCustomerEmail(order, items || []));
    } else {
      const customerSubject = `Order Confirmed: ${order.order_number} — Durga Print Studio`;
      await Promise.all([
        sendEmail(order.customer_email, fromEmail, customerSubject, buildCustomerEmail(order, items || [])),
        sendAdmin,
      ]);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-order-confirmation error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
