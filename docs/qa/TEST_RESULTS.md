# Resultados de pruebas WiseLife

## Identificación

- Rama de trabajo: `qa`
- Base: `origin/main` actualizado antes de crear la rama
- Stack: React 19, Vite 7.3.1, TypeScript, React Router 7, Supabase JS
- Fecha de auditoría: 2026-08-07
- Evidencia visual: `/tmp/agent-browser/wiselife-qa-desktop.png`, `/tmp/agent-browser/wiselife-qa-mobile.png`

## Resumen

| Área | Estado | Resultado |
|---|---|---|
| Build | PASS | `tsc -b && vite build` exitoso |
| Lint | FAIL | 22 errores, 3 advertencias |
| Smoke home desktop | PASS | Renderiza, navegación y controles visibles |
| Smoke home mobile | PASS | Renderiza en 375×667 sin bloqueo visual evidente |
| Funcionales autenticadas | PENDIENTE | Requiere cuentas y datos sintéticos |
| Integración Supabase/RLS | PENDIENTE | El esquema no pudo cargarse desde la integración en esta ejecución |
| Seguridad dinámica | PENDIENTE | Requiere staging y pruebas negativas autorizadas |
| Rendimiento | RIESGO | Bundle JS 826.04 KB minificado; advertencia de chunk >500 KB |
| Accesibilidad automatizada | PENDIENTE | Requiere ejecución axe/Lighthouse y revisión manual completa |

## Evidencia técnica

### Build

`npm run build` pasa. Vite reporta:

- CSS: 216.58 KB minificado / 28.78 KB gzip.
- JS principal: 826.04 KB minificado / 225.83 KB gzip.
- Warning: chunks mayores a 500 KB; se recomienda `import()`/code splitting.

### Lint

`npm run lint` falla. Hallazgos principales:

- `ClinicalHistoryView`: `any` y dependencia faltante de `useEffect`.
- `ClinicalRecordModal`: `any` y variable `err` sin uso.
- `SessionNoteModal`: hooks condicionales, `any` y variable sin uso.
- `AuthContext`: warning de Fast Refresh.
- `PsychologistDashboard`: `prefer-const`, acceso a función antes de declarar, dependencia faltante y variable sin uso.
- `Specialists`: `prefer-const`.

### Revisión estática de seguridad/SEO

- `src/lib/supabase.ts` contiene URL y clave anon fallback; la anon key no es service-role, pero no debe mantenerse hardcodeada como configuración de producción.
- No se encontraron referencias a `SUPABASE_SERVICE_ROLE_KEY` en `src`.
- `index.html` conserva favicon `/vite.svg` y título `Vite + React + TS`.
- Se detectaron `href="#"` en login/header y anchors legales sin destinos implementados.
- Sidebar referencia destinos que deben compararse con la tabla de rutas de `App.tsx`.

## Defectos abiertos

| ID | Sev. | Área | Descripción | Estado |
|---|---|---|---|---|
| QA-001 | P1 | Calidad | Lint bloquea CI con 22 errores | Abierto |
| QA-002 | P1 | Rendimiento | Bundle principal supera 800 KB minificado | Abierto |
| QA-003 | P1 | SEO | Título/favicon heredados de Vite | Abierto |
| QA-004 | P1 | Navegación | Enlaces `#` y destinos Sidebar requieren validación/corrección | Abierto |
| QA-005 | P1 | Seguridad/config | Fallback de configuración Supabase hardcodeado en cliente | Abierto |
| QA-006 | P2 | Verificación | Cobertura autenticada, RLS y roles pendiente | Pendiente |
| QA-007 | P2 | Accesibilidad | Falta auditoría automatizada axe/Lighthouse y lector de pantalla | Pendiente |

## Decisión

**NO APROBADO para producción.** El build y smoke visual son positivos, pero lint, SEO, bundle y validaciones de seguridad/integración pendientes impiden la aprobación. Repetir la suite después de cerrar QA-001 a QA-005.
