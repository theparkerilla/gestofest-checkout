# Checkout GestoFest — Premium anual

Página de pago con el Payment Brick de Mercado Pago, con la estética de la campaña GestoFest (banner animado, degradé violeta→menta, resaltado lila, CTA verde) y backend con la API de Orders de Mercado Pago.

## Archivos
- `index.html` → la página (servirla en `/gestofest`, por ejemplo `gestofest/index.html` dentro del repo).
- `api/process-payment.js` → crea la Order (tarjeta de crédito, tarjeta de débito, efectivo).
- `assets/gestofest-banner.gif` → banner de la campaña.
- `api/create-preference.js` → habilita dinero en cuenta de MP y cuotas sin tarjeta.

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
- Para cambiar colores o textos del formulario de MP: `BRICK_STYLE` y `BRICK_TEXTS` en `index.html`.
- El logo se toma del logo oficial de gestorando.com. Si el sitio nuevo tiene un SVG del wordmark en blanco, conviene reemplazar el `<svg class="logo-img">` por ese archivo.
- Activación de Premium: el pago lleva `metadata.campaign = "gestofest"` y `external_reference` para cruzarlo con la lista de usuarios.
- Modo demo: `DEMO_MODE: true` en `CONFIG` muestra el formulario real de MP y simula el resultado sin cobrar.
