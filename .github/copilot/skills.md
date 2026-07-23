# Skills para DogWeb

## Información General
- **Nombre del Proyecto:** DogWeb
- **URL:** https://dogweb.lat
- **Propósito:** Desarrollo y diseño de páginas web profesionales para negocios en Bogotá y Colombia.
- **Tecnologías:** HTML plano, Tailwind CSS v4 (CDN), Lucide icons, Google Fonts (Inter)

## Contexto del Proyecto
Landing page de servicios de desarrollo web. Ofrece diseño de páginas web, landing pages, y presencia digital para emprendedores y pymes. Chat flotante Cristal para captación. Formulario con captcha que envía a webhook n8n. Sin framework JS — todo HTML plano con Tailwind via CDN.

## Funcionalidades Principales
1. **Chat Cristal** — Bot flotante scriptado en `/chat/cristal.js`. Árbol: cotizar → form, agendar → calendly, soporte → datos de contacto. Afirmaciones libres → form o WA.
2. **Formulario de contacto** — Nombre, teléfono, email, tipo de proyecto, presupuesto, mensaje. Envía POST a n8n webhook. Sin reCAPTCHA.
3. **Sección de portafolio/servicios** — Diseño web, landing pages, SEO básico, mantenimiento.

## Información que debe conocer la IA
- **Bases de datos:** No tiene. Los formularios van a webhook n8n.
- **APIs usadas:** n8n webhook, Lucide icons (CDN), Tailwind CSS (CDN).
- **Usuarios objetivo:** Emprendedores, pymes, profesionales independientes en Colombia que necesitan página web.
- **Problemas comunes:** El sitio no usa React ni Vite — todo es HTML plano. Los cambios se hacen directamente en `index.html`. El botón flotante de WhatsApp fue eliminado (reemplazado por Cristal).
- **Contacto unificado:** Email `serviciosapcsoporte@gmail.com`, WA `wa.me/573337450634`, dirección `Cra. 52c #39b-22, Bogotá`.

## Instrucciones para el Skill
La IA debe:
- Recordar que es HTML plano, no React. No agregar imports de framework.
- Usar Tailwind CDN para estilos, no CSS custom (salvo `estilos.css` si existe).
- No eliminar ni modificar Cristal sin autorización.
- Los datos de contacto son los mismos en los 5 sitios del ecosistema.

## Documentación de referencia
- `index.html` — Página completa (todo en un archivo)
- `chat/cristal.js` — Motor del chat flotante
