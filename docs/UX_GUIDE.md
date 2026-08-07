# UX_GUIDE.md — WiseLife

**Propósito:** principios UX/UI, experiencia, estilos y reglas de diseño.
**Responsable:** Arquitecto UX/UI. **Estado:** Requiere validación visual y de contenido.

## Principios
Privacidad visible, lenguaje claro, decisiones reversibles, accesibilidad WCAG 2.2 AA, mobile-first, estados completos y no diagnóstico por automatización.

## Flujos
Landing → auth → onboarding → descubrimiento → perfil especialista → disponibilidad → reserva/pago → citas. El psicólogo sigue onboarding profesional → disponibilidad → agenda → nota clínica autorizada.

## Reglas de interfaz
Cada pantalla define loading, empty, error y success; formularios tienen labels, ayuda y errores asociados; acciones sensibles requieren confirmación; datos clínicos se minimizan y nunca aparecen en URLs o logs.

## Responsive y accesibilidad
Validar 320/375/768/1024/1440 px, teclado, foco visible, contraste, zoom 200%, lector de pantalla, touch targets de 44 px y `prefers-reduced-motion`.

## Sistema visual
Usar tokens y componentes compartidos, sin estilos duplicados. Tipografía y paleta deben permanecer en la implementación existente; cambios de marca requieren aprobación de UX/UI.

## SEO y privacidad de rutas
La superficie pública debe tener contenido único, idioma `es-CO`, title, description, canonical, Open Graph y datos estructurados verificables. Login, callback, recuperación, onboarding, dashboards, citas y perfiles privados no se indexan ni aparecen en sitemap; `robots` no sustituye autorización. No enviar PII/PHI a analítica, Schema.org, mapas de calor ni previews.

## Pendientes `[POR DEFINIR]`
Tokens oficiales, copy legal, estados de pago, política de cancelación, decisión de indexación de perfiles y pruebas con usuarios — **Responsable:** Arquitecto UX/UI + Product Owner + Legal.

## Referencias
`COMPONENTES.md`, `PRODUCT_BACKLOG.md`, `PLAN_PRUEBAS.md`.
