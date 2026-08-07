# Inventario de componentes WiseLife

Este inventario conecta la UI existente con la API objetivo del Design System. La adopción es incremental: primero tokens y componentes de alto tráfico, después superficies clínicas.

| Área | Existente localizado | API oficial objetivo | Prioridad |
|---|---|---|---|
| Acción | `src/components/Button` | `Button` con `primary`, `secondary`, `tertiary`, `danger`; `sm`, `md`, `lg` | P0 |
| Tipografía | `src/components/Typography` | `Text`, `Heading`, `Label`, `Caption` con escala semántica | P0 |
| Iconos | `src/components/Icon` | wrapper Lucide con tamaño, `aria-hidden` y label | P0 |
| Navegación | `Header`, `Sidebar`, `DashboardLayout` | landmarks, navegación activa, teclado y responsive | P0 |
| Formularios | Login, onboarding, encuestas | `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch` | P0 |
| Feedback | pantallas de auth y agenda | `Alert`, `Toast`, `Badge`, estados de carga y error | P1 |
| Contenido | especialistas, perfiles, testimonios | `Card`, `Avatar`, `EmptyState`, `Skeleton` | P1 |
| Clínico | modal de historia y dashboard psicólogo | `ClinicalCard`, `ClinicalModal`, `StatusBadge`, permisos visibles | P1 |
| Overlay | `ClinicalRecordModal` y diálogos | `Modal`, `Drawer`, foco atrapado, retorno de foco | P1 |
| Datos | agenda y dashboards | `Table`, `Tabs`, `Pagination`, filtros accesibles | P2 |

## Contratos comunes

- Todos los controles aceptan `id`, `aria-describedby`, `disabled` y estados de validación cuando corresponda.
- Variantes visuales solo se agregan si representan una intención semántica real.
- Los iconos no sustituyen labels; las acciones icon-only requieren `aria-label`.
- Las superficies clínicas no reutilizan automáticamente estilos promocionales de la landing.
- Los componentes deben consumir tokens de `docs/design-tokens.css` al implementarse; no añadir hex locales.

## Orden de adopción

1. Cargar tokens en la capa global sin modificar lógica de negocio.
2. Normalizar Button, Typography e Icon y sus estados accesibles.
3. Migrar Header, Sidebar y layouts para establecer navegación consistente.
4. Migrar campos de auth, onboarding y encuestas.
5. Migrar tarjetas, feedback y overlays.
6. Revisar dashboards, agenda e historia clínica con privacidad y responsive.

## Fuera de alcance de este documento

No define persistencia, endpoints, permisos de backend ni reglas clínicas. Esos contratos deben mantenerse en sus documentos técnicos respectivos.
