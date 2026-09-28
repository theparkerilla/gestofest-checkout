// Vercel Serverless Function — POST /api/process-payment
// Recibe el formData del Payment Brick y crea una Order en Mercado Pago (API de Orders).
// Requiere la variable de entorno MP_ACCESS_TOKEN (Vercel → Settings → Environment Variables).

const crypto = require("crypto");

const PRICE = "41500.00"; // Plan Premium anual. El monto SIEMPRE se fija acá, nunca desde el navegador.

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const f = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  // El front manda selectedPaymentMethod: "credit_card" | "debit_card" | "ticket"
  const type = f.selectedPaymentMethod || f.payment_type_id || "credit_card";

  const paymentMethod = { id: f.payment_method_id, type };
  if (f.token) paymentMethod.token = f.token;
  if (type === "credit_card" || type === "debit_card") paymentMethod.installments = Number(f.installments) || 1;

  const order = {
    type: "online",
    processing_mode: "automatic",
    total_amount: PRICE,
    external_reference: `gestofest-${Date.now()}`,
    description: "Gestorando Premium – Plan anual (GestoFest)",
    payer: {
      email: f.payer?.email,
      ...(f.payer?.identification ? { identification: f.payer.identification } : {}),
      ...(f.payer?.first_name ? { first_name: f.payer.first_name } : {}),
      ...(f.payer?.last_name ? { last_name: f.payer.last_name } : {}),
    },
    transactions: { payments: [{ amount: PRICE, payment_method: paymentMethod }] },
  };

  try {
    const r = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(order),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("MP order error", JSON.stringify(data));
      // Un rechazo de tarjeta también puede venir como error: lo tratamos como "rejected".
      return res.status(200).json({ id: data?.data?.id || null, status: "rejected", status_detail: data?.errors?.[0]?.code || data?.message });
    }

    const pay = data.transactions?.payments?.[0] || {};
    // Traducimos el estado de la Order al formato que usa el front.
    let status = "pending";
    if (data.status === "processed" && (data.status_detail === "accredited" || pay.status === "processed")) status = "approved";
    else if (data.status === "failed" || pay.status === "failed") status = "rejected";
    else if (data.status === "action_required") status = "pending";

    return res.status(200).json({
      id: data.id,
      status,
      status_detail: data.status_detail,
      transaction_details: { external_resource_url: pay.payment_method?.ticket_url || null },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
};
