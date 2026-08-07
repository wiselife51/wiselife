# Estrategia SEO de lanzamiento

## 1. Posicionamiento y arquitectura de información

### Propuesta de búsqueda

WiseLife debe presentarse como una experiencia segura y profesional para encontrar apoyo psicológico, con énfasis en atención clínica, confidencialidad, modalidad online y cobertura en Bogotá. El tono debe ser claro, humano y responsable; no usar lenguaje de urgencia artificial ni promesas terapéuticas.

### Clúster inicial

- **Principal:** psicología clínica en Bogotá, terapia psicológica online, psicólogo profesional.
- **Necesidad:** apoyo emocional, salud mental, ansiedad, estrés, duelo y autoestima.
- **Confianza:** psicología clínica profesional, atención confidencial, cómo elegir psicólogo.
- **Local:** psicólogo en Bogotá y barrios/zonas solo cuando exista oferta real y contenido verificable.

No crear páginas individuales para cada keyword. Cada landing debe resolver una intención completa, incluir CTA, preguntas frecuentes revisadas y enlaces internos contextuales.

### Rutas y jerarquía

| Superficie | Indexación inicial | Requisito |
| --- | --- | --- |
| Página pública principal | Sí | Title, description, canonical, OG, JSON-LD y contenido único |
| Especialistas y perfiles | No inicialmente | Indexar solo con consentimiento, contenido editorial estable, control de datos personales y estrategia de perfiles |
| Login, callback y recuperación | No | `noindex` y bloqueo de rastreo |
| Dashboard, citas, perfil, onboarding y encuestas | No | `noindex`, protección de sesión y no inclusión en sitemap |

## 2. Fases

### Fase 0: pre-lanzamiento técnico

- Definir `VITE_SITE_URL` en cada entorno y confirmar que producción no usa localhost.
- Validar una sola URL canónica, redirecciones HTTPS y host preferido.
- Publicar `robots.txt` con sitemap y exclusiones de rutas privadas.
- Publicar sitemap XML con solo URLs elegibles y `lastmod` real.
- Confirmar que no haya bloqueos accidentales por `robots`, `noindex`, errores 4xx/5xx o SPA fallback.
- Configurar Search Console, analítica con consentimiento y eventos de conversión.

### Fase 1: lanzamiento

- Enviar sitemap a Search Console.
- Inspeccionar la URL principal y solicitar indexación si procede.
- Verificar resultados enriquecidos, Open Graph y previews de mensajería.
- Registrar baseline de Lighthouse/PageSpeed en móvil y escritorio.
- Revisar manualmente la página en lectores de pantalla, teclado y conexión limitada.

### Fase 2: primeras semanas

- Revisar consultas, páginas descubiertas, cobertura, CTR y conversiones cualificadas.
- Corregir canibalización, títulos truncados, enlaces rotos y páginas excluidas inesperadamente.
- Publicar contenido de apoyo solo con revisión clínica y legal.
- Solicitar enlaces de entidades legítimas: asociaciones, aliados, directorios profesionales y organizaciones locales.

### Fase 3: crecimiento controlado

- Evaluar indexación de especialistas con consentimiento y gobernanza de perfiles.
- Crear landings locales o por servicio solo si hay demanda, capacidad operativa y contenido diferencial.
- Añadir FAQPage o contenido equivalente solo cuando las preguntas y respuestas sean visibles en la página y cumplan las políticas vigentes.
- Auditar trimestralmente enlaces, datos estructurados, privacidad y rendimiento.

## 3. Metadatos y Open Graph

### Página principal

- **Title:** `Psicología clínica profesional en Bogotá | WiseLife`
- **Description:** explicar propuesta, modalidad y confianza en 150–160 caracteres aproximados, sin promesas médicas.
- **Canonical:** `${VITE_SITE_URL}/`.
- **Robots:** `index,follow` únicamente para la superficie pública aprobada.
- **Open Graph:** `og:type=website`, `og:locale=es_CO`, `og:url`, `og:title`, `og:description`, `og:image` y `og:image:alt`.
- **Twitter/X:** `summary_large_image`, título, descripción e imagen consistente.
- La imagen social debe ser una composición real de marca, comprimida, con relación 1.91:1 y texto legible en móvil; no incluir datos de pacientes.

### Rutas privadas

Enviar `noindex,nofollow,noarchive` donde corresponda y evitar URLs de sesión en sitemap. El control primario debe ser la autorización de la aplicación; robots no es un mecanismo de seguridad.

## 4. Schema.org

Implementar JSON-LD separado de la presentación visual y mantenerlo sincronizado con contenido visible:

- `Organization` para la entidad WiseLife.
- `WebSite` para el sitio y su nombre oficial.
- `WebPage` para la página pública principal.
- `ProfessionalService` solo si los datos de negocio, ubicación y contacto son reales y verificables.
- `BreadcrumbList` cuando existan rutas públicas jerárquicas.
- `Person`/`ProfilePage` solo con consentimiento y sin revelar información sensible.

No usar `MedicalWebPage`, `MedicalBusiness` ni `Review` para aparentar autoridad o reseñas no verificables. Validar con Rich Results Test y Schema Markup Validator; los datos estructurados ayudan a comprender el contenido pero no garantizan rich results.

## 5. Contenido y autoridad

- Crear una guía editorial con revisión de psicólogos y fecha de actualización.
- Añadir autor, revisor clínico, fuentes y límites de la información cuando el contenido trate salud mental.
- Separar educación general de diagnóstico o tratamiento personalizado.
- No publicar testimonios identificables sin autorización explícita; anonimizar y documentar consentimiento.
- Usar enlaces internos desde la home hacia contenido público útil, no hacia rutas autenticadas.

## 6. Medición

### Eventos

- `cta_primary_click`
- `specialist_search_start`
- `contact_start`
- `booking_start` y `booking_complete` si aplica
- `faq_expand`
- `outbound_contact`

No enviar nombres, correos, diagnósticos, texto libre, IDs de pacientes ni datos clínicos a analítica o herramientas de sesión.

### KPIs

- Impresiones, clics, CTR y posición por intención.
- Sesiones orgánicas comprometidas y conversiones cualificadas.
- Porcentaje de URLs indexadas válidas y errores de cobertura.
- LCP, INP y CLS de campo por dispositivo y plantilla.
- Tasa de interacción con CTA y calidad del contacto, no solo volumen.

## 7. Gobernanza

Producto aprueba prioridades; contenido y profesionales revisan claims clínicos; ingeniería mantiene rastreo, rendimiento y datos estructurados; legal/privacidad valida consentimiento y exposición de perfiles. Cada cambio de ruta debe incluir una decisión explícita de indexación, metadatos, canonical, sitemap y pruebas.
