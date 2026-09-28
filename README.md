# Checkout GestoFest — Premium anual

Checkout de una sola página con layout estilo Shopify (formulario a la izquierda, resumen gris a la derecha, resumen plegable en mobile) y acentos GestoFest. Medios de pago: tarjeta (Card Payment Brick embebido en el acordeón), Mercado Pago (redirección con preferencia) y efectivo (Rapipago / Pago Fácil vía API de Orders).

## Archivos
- `index.html` → la página (servirla en `/gestofest`, por ejemplo `gestofest/index.html` dentro del repo).
- `api/process-payment.js` → crea la Order (tarjeta de crédito, tarjeta de débito, efectivo).
- `assets/gestofest-logo.png` → logo del header (recortado del banner). `assets/gestofest-banner.gif` queda como recurso de campaña.
- `api/create-preference.js` → crea la preferencia para la opción "Mercado Pago" (dinero en cuenta, Cuotas sin Tarjeta) y devuelve el link de pago.

## Configuración (5 minutos)
1. En `index.html`, bloque `CONFIG`: pegar la **Public Key** de producción.
2. En Vercel → Settings → Environment Variables:
   - `MP_ACCESS_TOKEN` = Access Token de producción (**nunca** va en el HTML).
   - `SITE_URL` = `https://gestorando.com` (opcional).
   - `MP_WEBHOOK_URL` = endpoint de notificaciones (opcional; recomendado para activar Premium automáticamente cuando se acredita un pago en efectivo).
3. Si la carpeta `api/` va dentro de un subdirectorio, ajustar `PREFERENCE_ENDPOINT` y `PAYMENT_ENDPOINT` en `CONFIG`.
4. Probar con credenciales de prueba y tarjetas de prueba de MP antes de pasar a producción.

## Notas
- El precio ($41.500) está fijado en el servidor: aunque alguien modifique el HTML, se cobra el monto correcto.
- Colores del checkout: variables `:root` en `index.html`. Estilo del formulario de tarjeta: `CARD_STYLE`.
- Activación de Premium: el pago lleva `metadata.campaign = "gestofest"` y `external_reference` para cruzarlo con la lista de usuarios.
- Modo demo: `DEMO_MODE: true` en `CONFIG` muestra el formulario real de MP y simula el resultado sin cobrar.
