# UX_GUIDE.md — WiseLife

**Propósito:** fuente de verdad para decisiones UX/UI, accesibilidad, privacidad y consistencia visual de WiseLife.
**Responsable:** Arquitectura UX/UI, en coordinación con Frontend, Producto, Seguridad y Legal.
**Estado:** Vigente para la rama `arq_ux_ui`; requiere validación visual en cada superficie nueva.

## Principios no negociables

1. **Privacidad visible:** explicar qué dato se solicita, para qué se usa y quién puede verlo.
2. **Lenguaje claro:** español de Colombia (`es-CO`), tono humano, profesional y no estigmatizante.
3. **Decisiones reversibles:** permitir cancelar, volver y corregir antes de acciones sensibles.
4. **Accesibilidad por defecto:** objetivo WCAG 2.2 AA, navegación por teclado y foco visible.
5. **Mobile-first:** diseñar desde 320 px y ampliar progresivamente sin perder jerarquía.
6. **Estados completos:** loading, vacío, error, éxito y estado deshabilitado deben formar parte del diseño.
7. **No diagnóstico automatizado:** la interfaz puede apoyar procesos clínicos, pero no presenta conclusiones clínicas generadas automáticamente como diagnóstico.

## Flujos actualmente representados

- **Paciente:** `Home` → `Login` → `Onboarding` → `Dashboard` → `Specialists` → `SpecialistProfile` → `MisCitas`.
- **Encuestas:** `MotivationSurvey` y `ReferralSurvey`.
- **Psicólogo:** `PsychologistLogin` → `PsychologistOnboarding` → `PsychologistDashboard`.
- **Sesión:** `AuthCallback` gestiona el retorno de autenticación.

Los nombres anteriores corresponden a las rutas existentes en `src/pages`. Cualquier flujo nuevo debe documentarse aquí y en `docs/COMPONENTES.md` antes de incorporarse a navegación principal.

## Reglas de interfaz

- Toda pantalla debe definir loading, empty, error y success; los mensajes deben explicar qué ocurrió y el siguiente paso.
- Todo campo debe tener `label` visible o accesible, ayuda contextual cuando sea necesaria y error asociado mediante `aria-describedby`.
- Las acciones destructivas, clínicas o relacionadas con pagos requieren confirmación explícita y feedback seguro.
- No mostrar datos clínicos en URLs, títulos de página, logs, mensajes de error ni previews.
- No depender únicamente de color para comunicar estado; acompañar con texto, icono consistente o estructura semántica.
- Los botones deben describir la acción (`Reservar cita`, `Guardar nota`) y no usar textos ambiguos como `Continuar` cuando pueda aclararse.
- Evitar modales para tareas largas; usar la página o un flujo dedicado cuando el contexto clínico lo requiera.

## Sistema visual oficial

La implementación debe consumir los tokens definidos en [`design-tokens.css`](design-tokens.css). La dirección oficial es:

- **Color:** superficies claras y neutras, texto azul tinta, teal como color de acción y estados semánticos con contraste AA.
- **Tipografía:** `Inter` para interfaz y `Source Serif 4` únicamente para énfasis editorial; no introducir una tercera familia.
- **Forma:** radios moderados, bordes sutiles y jerarquía basada en espacio, no en sombras o gradientes.
- **Espaciado:** escala de 4 px; usar los tokens en lugar de valores aislados.
- **Iconografía:** Lucide, trazo consistente de 2 px, iconos acompañados por texto cuando la acción no sea universal.
- **Componentes:** priorizar los existentes en `src/components` y evitar estilos duplicados por página.

No usar nuevos hexadecimales, gradientes decorativos o iconos emoji sin una decisión documentada de UX/UI.

## Responsive y accesibilidad

Validar como mínimo en 320, 375, 768, 1024 y 1440 px. Cada entrega debe comprobar:

- teclado completo, orden de foco y foco visible;
- contraste de texto, controles y estados;
- zoom al 200% y reflow sin scroll horizontal innecesario;
- targets táctiles de al menos 44 × 44 px;
- lector de pantalla, nombres accesibles y mensajes dinámicos;
- `prefers-reduced-motion`, sin depender de animación para comprender o completar una tarea.

## SEO, privacidad y rutas

La superficie pública debe tener contenido único, idioma `es-CO`, `title`, `description`, canonical, Open Graph y datos estructurados verificables. Login, callback, recuperación, onboarding, dashboards, citas y perfiles privados no se indexan ni aparecen en sitemap; `robots` no sustituye la autorización.

No enviar PII/PHI a analítica, Schema.org, mapas de calor, URLs, logs ni previews. Cualquier integración de medición debe documentar eventos permitidos, retención y exclusiones antes de activarse.

## Criterios de aceptación UX

Una pantalla está lista cuando:

- usa los tokens y componentes oficiales;
- tiene estados completos y manejo de error comprensible;
- supera la revisión de teclado, contraste, zoom y lector de pantalla;
- no expone PII/PHI ni permite inferir permisos desde la UI;
- se valida en móvil y escritorio;
- queda registrada en `docs/COMPONENTES.md` si introduce o cambia un componente reutilizable.

## Decisiones pendientes

- Copy legal, consentimiento informado y política de cancelación: Producto + Legal.
- Indexación de perfiles públicos: Producto + Legal + Seguridad.
- Pruebas con usuarios y validación visual: UX/UI + Producto.
- Migración progresiva de estilos legacy a tokens: Frontend + UX/UI.

## Referencias

- [`COMPONENTES.md`](COMPONENTES.md)
- [`design-tokens.css`](design-tokens.css)
- [`ARQUITECTURA.md`](ARQUITECTURA.md)
- [`PLAN_PRUEBAS.md`](PLAN_PRUEBAS.md)
- [`SEGURIDAD.md`](SEGURIDAD.md)
