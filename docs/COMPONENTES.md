# COMPONENTES.md — WiseLife

**Propósito:** catálogo vigente de componentes frontend, límites de responsabilidad y contratos de composición.
**Responsables:** Frontend + Arquitectura UX/UI.
**Estado:** Sincronizado con la estructura existente en `src/components` y `src/pages`.

## Arquitectura de composición

- `src/pages/<Page>` coordina datos, navegación y composición de pantalla.
- `src/components/<Component>` contiene componentes reutilizables con su hoja de estilos local.
- `src/components/section` agrupa secciones visuales de páginas públicas.
- Los estilos transversales están distribuidos entre hojas globales y estilos locales; `docs/design-tokens.css` es una referencia documental y no una fuente runtime confirmada.
- Las páginas actuales no se reorganizan automáticamente en `src/features`; esa estructura queda como objetivo de migración, no como ruta válida actual.
- La UI no sustituye autorización: los permisos se validan en la capa de datos y servicios.

## Catálogo implementado

### Shell y navegación

- `src/App.tsx`: composición raíz y enrutamiento de la aplicación.
- `src/components/Main`: contenedor principal de contenido.
- `src/components/Header`: cabecera y navegación superior.
- `src/components/Sidebar`: navegación contextual para superficies autenticadas.
- `src/components/Footer`: pie de página público.
- `src/components/DashboardLayout`: estructura compartida de dashboards.

### Primitives visuales

- `src/components/Button`: acciones primarias/secundarias y estados interactivos.
- `src/components/Typography`: jerarquía tipográfica compartida.
- `src/components/Icon`: punto de entrada para iconografía consistente.

### Experiencia clínica y sesión

- `src/components/ClinicalHistoryView`: visualización de historia clínica.
- `src/components/ClinicalRecordModal`: consulta/edición modal de registro clínico.
- `src/components/SessionNoteModal`: captura de notas de sesión.

### Secciones públicas

- `src/components/section/Testimonials`: testimonios de la superficie pública.

## Pantallas existentes

- Público: `Home`, `Specialists`, `SpecialistProfile`.
- Autenticación: `Login`, `AuthCallback`, `PsychologistLogin`.
- Paciente: `Onboarding`, `Dashboard`, `Profile`, `MotivationSurvey`, `ReferralSurvey`, `MisCitas`.
- Psicólogo: `PsychologistOnboarding`, `PsychologistDashboard`.

Rutas y nombres deben mantenerse alineados con `src/pages` hasta que exista una migración aprobada. No documentar como implementado un componente que solo esté en el backlog.

## Contrato de cada componente

Cada componente reutilizable nuevo o modificado debe documentar, en su PR o archivo de referencia:

- **Props:** datos requeridos, opcionales y valores por defecto.
- **Eventos:** acciones emitidas y payloads, sin lógica de negocio oculta.
- **Estados:** loading, vacío, error, éxito, disabled y focus.
- **Accesibilidad:** elemento semántico, nombre accesible, teclado, foco y mensajes dinámicos.
- **Permisos:** qué puede ocultarse visualmente, dejando claro que la autorización real ocurre fuera de la UI.
- **Responsive:** comportamiento en 320, 768 y 1440 px como mínimo.
- **Privacidad:** datos que no deben aparecer en URLs, logs, analytics o previews.

## Reglas de implementación

1. Consultar la referencia documental [`design-tokens.css`](design-tokens.css); no añadir hexadecimales locales sin decisión de UX/UI. Si se requiere uso runtime, primero debe definirse y versionarse una fuente canónica en el frontend.
2. Preferir Flexbox para layout; usar Grid solo en relaciones bidimensionales reales.
3. Reutilizar `Button`, `Typography` e `Icon` antes de crear variantes por página.
4. Mantener estilos junto al componente y evitar selectores globales que filtren a otras pantallas.
5. La iconografía debe pasar por `src/components/Icon` cuando sea reutilizable. El proyecto usa `react-icons`; no se debe afirmar uso de Lucide sin una dependencia y una implementación verificables. No usar emoji como iconografía.
6. Los modales deben gestionar foco, cierre por teclado y retorno de foco; evitar usarlos para procesos clínicos extensos.
7. Los componentes que muestran datos clínicos deben minimizar contenido visible y no registrar PII/PHI.

## API objetivo para primitives

| Componente | API mínima recomendada |
| --- | --- |
| `Button` | `variant`, `size`, `loading`, `disabled`, `type`, `aria-label` cuando no haya texto |
| `Typography` | `as`, `variant`, `children`, `className` |
| `Icon` | `name`, `size`, `title`, `aria-hidden` |
| `Modal` futuro | `open`, `onOpenChange`, `title`, `description`, `children` |
| `Field` futuro | `label`, `hint`, `error`, `required`, `id`, `children` |
| `StatusMessage` futuro | `tone`, `title`, `description`, `icon`, `live` |

Las APIs pueden ampliarse, pero no deben romper nombres accesibles, estados ni composición existentes.

## Migración y deuda conocida

- Migrar gradualmente estilos legacy de las páginas a tokens compartidos.
- Consolidar primitives futuros (`Modal`, `Field`, `StatusMessage`, `Card`) después de revisar duplicación real.
- Añadir cobertura de pruebas visuales/Storybook cuando el proyecto adopte esa herramienta.
- Registrar componentes obsoletos antes de retirarlos y comprobar consumidores en todas las páginas.

## Referencias

- [`UX_GUIDE.md`](UX_GUIDE.md)
- [`design-tokens.css`](design-tokens.css)
- [`ARQUITECTURA.md`](ARQUITECTURA.md)
- [`PLAN_PRUEBAS.md`](PLAN_PRUEBAS.md)
