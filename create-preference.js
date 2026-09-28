// Vercel Serverless Function — POST /api/create-preference
// Crea una preferencia y devuelve init_point: el checkout redirige ahí cuando eligen "Mercado Pago"
// (dinero en cuenta, tarjetas guardadas, Cuotas sin Tarjeta).

const PRICE = 41500;
const SITE = process.env.SITE_URL || "https://gestorando.com";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  try {
    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          id: "premium-anual",
          title: "Gestorando Premium – Plan anual",
          quantity: 1,
          unit_price: PRICE,
          currency_id: "ARS",
        }],
        ...(b.payer?.email ? { payer: { email: b.payer.email, name: b.payer.first_name, surname: b.payer.last_name, identification: b.payer.identification } } : {}),
        external_reference: `gestofest-${Date.now()}`,
        metadata: { campaign: "gestofest", plan: "premium_anual" },
        back_urls: {
          success: `${SITE}/gestofest/gracias`,
          pending: `${SITE}/gestofest/gracias`,
          failure: `${SITE}/gestofest`,
        },
        auto_return: "approved",
        ...(process.env.MP_WEBHOOK_URL ? { notification_url: process.env.MP_WEBHOOK_URL } : {}),
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || "preference_error" });
    return res.status(200).json({ id: data.id, init_point: data.init_point });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
};
