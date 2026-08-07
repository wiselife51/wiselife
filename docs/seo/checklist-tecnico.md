# Checklist técnico SEO

## Core Web Vitals y rendimiento

### Objetivos de campo (p75)

- **LCP:** ≤ 2.5 s.
- **INP:** ≤ 200 ms.
- **CLS:** ≤ 0.1.
- **TTFB de referencia:** ≤ 0.8 s cuando la infraestructura y región lo permitan.

### Acciones

- Medir en móvil y escritorio con datos de campo y laboratorio; separar desarrollo de producción.
- Identificar el elemento LCP y priorizar su recurso sin cargar contenido no crítico antes.
- Comprimir imágenes, definir `width`/`height`, usar formatos modernos y `loading="lazy"` fuera del viewport inicial.
- Reservar espacio para imágenes, fuentes, banners y embeds para evitar CLS.
- Usar `preload` solo para el recurso LCP real; evitar precargas indiscriminadas.
- Mantener video de fondo no bloqueante: `muted`, `playsinline`, `preload="metadata"`, poster optimizado y alternativa accesible.
- Reducir JavaScript inicial, dividir rutas privadas y eliminar librerías no utilizadas.
- Evitar tareas largas: diferir widgets, analítica y chat hasta consentimiento o interacción.
- Cachear assets con hash, habilitar compresión y revisar headers de CDN.
- Medir INP en navegación, filtros, formularios y CTA, no solo en carga.

### QA de rendimiento

- Lighthouse móvil: sin errores críticos y con evidencia de mejoras.
- PageSpeed Insights/CrUX: revisar p75 cuando exista tráfico suficiente.
- `agent-browser vitals` o herramienta equivalente en una build de producción.
- Prueba con CPU ralentizada, red 4G y viewport móvil.
- Comparar cada release contra el baseline; bloquear regresiones de LCP/CLS/INP acordadas por el equipo.

## Rastreo e indexación

- [ ] HTTPS y host canónico redirigen correctamente.
- [ ] `VITE_SITE_URL` está definido y no contiene localhost en producción.
- [ ] `robots.txt` es accesible, no bloquea CSS/JS necesarios y enlaza al sitemap.
- [ ] Sitemap XML contiene solo URLs 200, canónicas, públicas e indexables.
- [ ] Las rutas privadas tienen `noindex` y no aparecen en sitemap.
- [ ] No hay cadenas de redirecciones, soft 404, enlaces rotos ni duplicados por parámetros.
- [ ] La SPA sirve un HTML inicial con title, description y contenido suficiente para el renderizado.
- [ ] Enlaces importantes son elementos `<a>` reales con nombres accesibles.
- [ ] Se revisan Search Console, cobertura, inspección URL y acciones manuales.

## Metadatos

- [ ] Un `<title>` único por página pública, descriptivo y sin keyword stuffing.
- [ ] `meta description` útil, localizada y distinta por intención.
- [ ] `lang="es"`, `og:locale="es_CO"` y copy coherente.
- [ ] `link rel="canonical"` absoluto y estable.
- [ ] `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:alt`.
- [ ] `twitter:card=summary_large_image` y campos correspondientes.
- [ ] Imagen social disponible, comprimida, sin información sensible y con contraste suficiente.
- [ ] Favicon, theme color y viewport configurados.

## Schema.org / JSON-LD

- [ ] JSON-LD válido, en `<script type="application/ld+json">` y sin datos inventados.
- [ ] `Organization`/`WebSite` con nombre, URL e identidad consistentes.
- [ ] `WebPage` describe la página visible y enlaza a la URL canónica.
- [ ] `ProfessionalService` solo con dirección, área de servicio, teléfono y horarios verificables.
- [ ] `BreadcrumbList` refleja la navegación visible.
- [ ] `ProfilePage` y `Person` requieren consentimiento, control editorial y minimización de datos.
- [ ] Las FAQ estructuradas son visibles y no sustituyen contenido útil.
- [ ] Validación en Schema Markup Validator y Rich Results Test.

## Accesibilidad que impacta SEO

- [ ] Un solo `h1` descriptivo por plantilla pública.
- [ ] Jerarquía de headings sin saltos arbitrarios.
- [ ] Alt text útil para imágenes informativas; `alt=""` para imágenes decorativas.
- [ ] Contraste, foco visible, navegación por teclado y labels asociados.
- [ ] Controles con nombres accesibles; no usar iconos o emojis como único nombre.
- [ ] Video con alternativa textual y respeto a `prefers-reduced-motion`.

## Seguridad y privacidad

- [ ] Robots y `noindex` no se consideran control de acceso.
- [ ] Rutas privadas requieren sesión y autorización del servidor.
- [ ] No enviar PHI/PII ni texto clínico a analítica, logs, mapas de calor o Schema.org.
- [ ] Consentimiento de cookies/medición documentado y reversible.
- [ ] Open Graph, previews y datos estructurados no exponen perfiles o citas privadas.

## Definition of Done por ruta pública

1. Keyword/intención y owner definidos.
2. Contenido revisado por producto y, si aplica, revisión clínica/legal.
3. Title, description, canonical, OG/Twitter y headings validados.
4. JSON-LD validado y consistente con el contenido visible.
5. Sitemap/robots actualizados según decisión de indexación.
6. Lighthouse, vitals, accesibilidad, responsive y enlaces verificados.
7. Evento de conversión y criterios de éxito documentados.
8. Evidencia adjunta en el PR y fecha de próxima revisión definida.
