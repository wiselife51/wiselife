# PLAN_PRUEBAS.md — WiseLife

**Propósito:** estrategia de pruebas, casos, criterios y validaciones QA.
**Responsable:** Ingeniero QA. **Estado:** Plan base; requiere datos sintéticos y ambientes.

## Alcance
Navegación pública, auth/callback/logout, onboarding, especialistas, disponibilidad, reserva/pago, citas, dashboard profesional, notas e historia clínica.

## Matriz mínima
| Área | Validaciones |
|---|---|
| Funcional | happy path, vacío, error, reintento, refresh y estados |
| Seguridad | RLS, BOLA/IDOR, roles, secrets, XSS y open redirects |
| Integración | Auth↔Supabase, queries↔RLS, agenda↔concurrencia, pago↔idempotencia |
| Accesibilidad | teclado, foco, labels, contraste, lector y zoom |
| Responsive | 320, 375, 768, 1024 y 1440 px |
| Rendimiento | LCP ≤2.5s, CLS ≤0.1, INP ≤200ms como objetivos iniciales |

## Ambientes y roles
Anónimo, paciente, psicólogo y usuario no autorizado; preview/local para smoke, Supabase para integración y staging aislado para seguridad/carga.

## Criterios de salida
No P0/P1 abiertos; P2 requiere aceptación explícita; toda incidencia tiene pasos, evidencia, severidad, responsable y retest.

## Pendientes `[POR DEFINIR]`
Herramienta de test, cobertura mínima, datos sintéticos, staging, pruebas de carga y evidencias — **Responsable:** QA + DevOps.

## Referencias
`PRODUCT_BACKLOG.md`, `SEGURIDAD.md`, `API.md`, `COMPONENTES.md`.
