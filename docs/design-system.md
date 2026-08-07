# WiseLife Design System

**Versión:** 1.0 · **Estado:** oficial · **Idioma de producto:** español

## Propósito

WiseLife es una plataforma de salud mental. El sistema debe comunicar calma, confianza y rigor clínico sin parecer hospitalario ni infantil. Esta documentación es la fuente de verdad para nuevas pantallas y para la migración gradual de la interfaz existente.

## Principios UX

1. **Humano antes que ornamental:** cada elemento visual debe ayudar a comprender, decidir o sentirse acompañado.
2. **Claridad clínica:** lenguaje directo, jerarquía evidente y estados comprensibles.
3. **Accesible por defecto:** WCAG 2.2 AA como mínimo; teclado, lectores de pantalla, contraste y touch targets son requisitos.
4. **Consistencia progresiva:** usar tokens y componentes antes de crear estilos locales.
5. **Privacidad visible:** no exponer información clínica en títulos, notificaciones o vistas compartidas.

## Dirección visual

La base es clara, cálida y sobria: superficies marfil muy suaves, texto azul tinta y teal como color de acción y confianza. El modo oscuro conserva la misma identidad con superficies azul petróleo. No usar gradientes violetas, sombras luminosas ni colores decorativos sin significado.

### Paleta semántica

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--wl-color-bg` | `#F7FAF9` | `#102326` | fondo de aplicación |
| `--wl-color-surface` | `#FFFFFF` | `#173136` | tarjetas y formularios |
| `--wl-color-surface-muted` | `#EDF4F2` | `#204047` | superficies secundarias |
| `--wl-color-text` | `#173238` | `#F3F8F7` | texto principal |
| `--wl-color-text-muted` | `#526A6D` | `#B6C9C8` | texto secundario |
| `--wl-color-border` | `#D6E3E0` | `#34545A` | divisores y controles |
| `--wl-color-primary` | `#147D78` | `#57C7B8` | acciones principales, enlaces |
| `--wl-color-primary-hover` | `#0F625F` | `#7AD8CA` | hover y énfasis |
| `--wl-color-focus` | `#D98745` | `#F0A96D` | anillo de foco visible |
| `--wl-color-success` | `#277A54` | `#70D49D` | completado y confirmado |
| `--wl-color-warning` | `#9A681A` | `#F0C36C` | atención no crítica |
| `--wl-color-danger` | `#B44145` | `#F38A8D` | errores y acciones destructivas |
| `--wl-color-info` | `#276B9A` | `#82BCE4` | información contextual |

Los estados deben incluir texto o icono además del color. El contraste mínimo es 4.5:1 para texto normal y 3:1 para texto grande o componentes gráficos.

## Tipografía

- **Familia principal:** `Inter`, fallback `system-ui, sans-serif`.
- **Familia auxiliar:** `ui-monospace, SFMono-Regular, monospace`, solo para IDs, fechas técnicas o datos clínicos exportables.
- No usar más de dos familias ni tipografías decorativas.

| Estilo | Tamaño / línea | Peso | Uso |
|---|---:|---:|---|
| Display | 48/56 | 700 | hero, máximo uno por vista |
| H1 | 36/44 | 700 | título de página |
| H2 | 28/36 | 700 | sección |
| H3 | 22/30 | 650 | tarjeta o subsección |
| Body large | 18/28 | 400 | introducciones |
| Body | 16/24 | 400 | contenido principal |
| Body small | 14/20 | 400 | ayuda, metadatos |
| Label | 13/18 | 600 | controles y tablas |
| Caption | 12/16 | 500 | información auxiliar, nunca instrucciones esenciales |

Los títulos deben usar `text-wrap: balance`; el cuerpo, `text-wrap: pretty`. Nunca comunicar información solo con mayúsculas, peso o color.

## Layout y tokens

- Unidad base: **4 px**. Escala aprobada: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.
- Contenedor: `max-width: 1200px`, padding horizontal `16px` móvil, `24px` tablet y `32px` escritorio.
- Breakpoints: `640px` móvil grande, `768px` tablet, `1024px` escritorio, `1280px` amplio.
- Radios: `8px` controles, `12px` cards, `16px` modales, `999px` pills.
- Elevación: una sombra suave para separar superficies; no usar sombras como decoración.
- Touch target mínimo: `44x44px`.
- Preferir Flexbox; usar Grid solo para relaciones bidimensionales como tablas, dashboards o galerías.
- Movimiento: 150 ms para feedback, 250 ms para transiciones de superficie. Respetar `prefers-reduced-motion`.

## Componentes reutilizables

### Acción y navegación

- **Button:** `variant=primary|secondary|tertiary|danger`, `size=sm|md|lg`, `loading`, `disabled`, `leadingIcon`, `trailingIcon`. Un solo primary por bloque. El loading conserva el ancho y anuncia `aria-busy`.
- **Link:** texto subrayado al hover/focus, siempre distinguible sin depender del color.
- **IconButton:** requiere `aria-label`, target 44 px y tooltip solo como apoyo.
- **Header / Sidebar:** landmarks semánticos, navegación de teclado, estado activo con texto y indicador visual; sidebar colapsable en tablet.
- **Tabs:** `aria-selected`, roving tabindex y panel asociado; no usar tabs para navegación principal.

### Formularios

- **Input, Select, Textarea:** label visible, descripción opcional, error asociado con `aria-describedby`, estado `invalid` y autocomplete correcto.
- **Checkbox, Radio, Switch:** usar para selección, exclusión y preferencias respectivamente; no sustituir uno por otro.
- Validar al enviar y mostrar error junto al campo; mantener valores introducidos y ofrecer corrección concreta.

### Contenido y estado

- **Card:** `default|interactive|clinical`; la variante clínica evita adornos y protege datos sensibles.
- **Badge:** `neutral|info|success|warning|danger`, para estados breves, no para párrafos.
- **Alert / Toast:** icono + título + mensaje; toast para feedback temporal no crítico, alert para contexto persistente. Nunca usar toast para errores que requieren acción.
- **Modal / Drawer:** foco atrapado, Escape, cierre explícito, título, descripción y retorno de foco al disparador.
- **Table:** encabezados reales, caption accesible, responsive con scroll horizontal controlado; en móvil convertir filas complejas en cards.
- **Avatar:** imagen con alt o iniciales; no exponer datos clínicos en alt.
- **Skeleton / Empty state:** skeleton solo mientras llega contenido; empty state explica por qué está vacío y ofrece una acción.
- **Appointment status:** `requested`, `confirmed`, `completed`, `cancelled`; combinar badge, texto y acciones permitidas.

## Iconografía

Usar Lucide como biblioteca oficial: stroke consistente de `1.75px`, tamaños 16 (inline), 20 (controles), 24 (navegación) y 32 (empty states). Usar nombres reconocibles (`Calendar`, `MessageCircle`, `ShieldCheck`, `CircleAlert`); nunca emojis, iconos dibujados a mano ni iconos como único contenido accionable. Los iconos decorativos llevan `aria-hidden="true"`; los informativos requieren texto alternativo.

## Patrones por superficie

- **Landing:** una promesa principal, prueba de confianza, explicación del proceso, especialistas y CTA. Mantener ritmo amplio y fotografías humanas no estereotipadas.
- **Auth:** formulario centrado, labels visibles, errores inline, ayuda de recuperación y lenguaje tranquilizador. No ocultar requisitos de contraseña.
- **Dashboard:** navegación persistente, título + contexto + acción primaria, estados resumibles y densidad controlada. Los datos sensibles requieren confirmación antes de acciones destructivas.
- **Historia clínica:** máxima privacidad, timestamps claros, permisos visibles, no truncar contenido clínico sin indicar que existe más información.

## Voz y contenido

Hablar de forma cálida, respetuosa y no estigmatizante. Preferir “Tu próxima sesión” sobre “Cita pendiente”; “No encontramos sesiones todavía” sobre “Sin datos”. Evitar promesas clínicas absolutas, alarmismo y tecnicismos sin explicación. Todo error debe decir qué ocurrió, qué puede hacer la persona y, cuando aplique, cómo obtener ayuda.

## Migración desde legacy

| Legacy | Sustitución oficial |
|---|---|
| `--color-primary` ambiguo | `--wl-color-primary` |
| gradientes morado/azul | superficie + `--wl-color-primary` |
| `.btn` global | componente Button con variantes |
| `.typography` genérico | escala tipográfica documentada |
| colores hex locales | tokens semánticos |
| iconos emoji o SVG ad hoc | Lucide con label accesible |

## Checklist de aceptación

- [ ] Cada color proviene de un token y cumple contraste.
- [ ] Estados hover, focus, disabled, loading y error están definidos.
- [ ] El flujo funciona con teclado y lector de pantalla.
- [ ] Targets táctiles tienen al menos 44 px.
- [ ] No hay información clínica comunicada solo por color.
- [ ] Se respeta `prefers-reduced-motion`.
- [ ] La pantalla responde en 320 px, tablet y escritorio.
- [ ] El contenido tiene jerarquía semántica y lenguaje claro.
