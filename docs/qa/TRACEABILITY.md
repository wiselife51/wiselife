# Matriz de trazabilidad QA

| Requisito | Casos | Evidencia actual | Estado |
|---|---|---|---|
| Navegación pública funcional | F01 | Snapshot home y capturas desktop/mobile | Parcial |
| Autenticación segura | F02, I01, S01 | Código AuthContext; sin flujo autenticado ejecutado | Pendiente |
| Onboarding y encuestas | F03, I02 | Rutas y componentes inspeccionados | Pendiente |
| Especialistas y perfil | F04, I03 | Rutas declaradas y componentes | Pendiente |
| Reserva y pago | F05, I04, S02 | Configuración Nequi detectada; sin transacción sintética | Pendiente |
| Citas y perfil | F06, I05, S03 | Componentes/rutas | Pendiente |
| Dashboard y notas clínicas | F07, I06, S04 | Componentes clínicos; requiere RLS negativa | Pendiente |
| Integridad de datos y RLS | I01-I06, S01-S05 | Schema Supabase no disponible en consulta | Pendiente |
| Rendimiento | P01-P04 | Build: JS 826.04 KB, CSS 216.58 KB | Riesgo |
| Accesibilidad WCAG 2.2 AA | A01-A08 | Revisión manual planificada | Pendiente |
| Responsive | R01-R06 | Capturas 936×680 y 375×667 del home | Parcial |
| Calidad de entrega | Q01 | Build PASS, lint FAIL | No aprobado |

## Convención de casos

- `F`: funcional
- `I`: integración
- `S`: seguridad
- `P`: performance
- `A`: accesibilidad
- `R`: responsive
- `Q`: calidad/gates

Cada caso debe enlazar en el issue o reporte final a la captura, log, trace o resultado de herramienta correspondiente.
