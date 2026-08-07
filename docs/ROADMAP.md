# Roadmap MVP — WiseLife

**Propósito:** convertir el Product Backlog en una secuencia de releases ejecutable por el Scrum Master y los equipos de Arquitectura, UX/UI, QA, Seguridad, Legal y DevOps.

**Fuente de verdad:** [`PRODUCT_BACKLOG.md`](./PRODUCT_BACKLOG.md).

## Objetivo del MVP

Liberar el núcleo operativo de WiseLife para que un paciente pueda registrarse, encontrar un psicólogo, reservar y pagar una sesión, mientras el psicólogo gestiona su disponibilidad, agenda y documentación clínica autorizada.

La seguridad, privacidad, autorización, RLS, concurrencia de reservas y trazabilidad son dependencias transversales desde el primer release. No son funcionalidades diferibles.

## Releases

### Release 0 — Fundaciones y decisiones de producto

**Propósito:** eliminar bloqueadores antes de planificar historias de negocio.

**Incluye:**

- Formalizar roles: paciente, psicólogo, administrador y soporte.
- Definir estados de cita, pago, perfil profesional y sesión clínica.
- Definir duración de sesión, zona horaria, expiración de reservas y anticipación mínima.
- Definir política de cancelación, reprogramación, inasistencia y reembolso.
- Aprobar consentimiento informado, tratamiento de datos y términos del servicio para Colombia.
- Revisar modelo de acceso, RLS, exposición de tablas y funciones de base de datos.
- Definir criterios de auditoría, retención y soporte.

**Puerta de salida:** decisiones documentadas, dependencias identificadas y criterios de aceptación refinados para MVP-1.

### MVP-1 — Acceso, descubrimiento y controles base

**Objetivo:** permitir que el paciente ingrese al producto y seleccione un psicólogo confiable.

**Historias principales:**

- WL-AUTH-01, WL-AUTH-02 y WL-AUTH-03.
- WL-PROF-01 y WL-PROF-02.
- WL-PSY-01 y WL-PSY-02.
- WL-DISC-01 y WL-DISC-03.

**Controles obligatorios:**

- WL-SEC-01: autorización por rol, aislamiento de datos y RLS.
- WL-SEC-02: términos, privacidad y consentimientos.
- Validación de sesión, protección de rutas y manejo seguro de errores.
- Revisión de exposición pública de datos personales y profesionales.

**Resultado de negocio:** un paciente puede crear su cuenta, completar su perfil y encontrar un psicólogo activo con disponibilidad válida.

**Puerta de salida:** pruebas de autenticación, autorización y privacidad aprobadas; ningún perfil privado o dato clínico queda expuesto.

### MVP-2 — Reserva, pagos y operación clínica mínima

**Objetivo:** completar el ciclo de reserva y permitir la operación de una sesión.

**Historias principales:**

- WL-BOOK-01, WL-BOOK-02, WL-BOOK-03, WL-BOOK-04 y WL-BOOK-05.
- WL-OPS-01, WL-OPS-02 y WL-OPS-03.
- WL-CLIN-01, WL-CLIN-02 y WL-CLIN-03.
- WL-NOTIF-01.

**Controles obligatorios:**

- Reserva atómica contra doble asignación de una franja.
- Separación estricta entre estado de pago y estado de cita.
- Validación server-side de monto, referencia y transiciones de estado.
- Acceso clínico únicamente para el psicólogo autorizado.
- Auditoría mínima de pagos, cancelaciones y acciones clínicas sensibles.
- Manejo de errores, reintentos y fallos de notificación.

**Resultado de negocio:** el paciente puede reservar, reportar el pago y gestionar la cita; el psicólogo puede aprobar el pago, operar su agenda y registrar la atención.

**Puerta de salida:** flujo completo probado desde reserva hasta cierre de sesión, con pruebas de concurrencia, permisos, pagos y datos clínicos.

### MVP ampliado — Soporte y control operativo

**Objetivo:** mejorar conversión, continuidad terapéutica y capacidad de operación sin bloquear el núcleo.

**Historias:**

- WL-DISC-02 — filtros avanzados.
- WL-BOOK-06 — reprogramación.
- WL-CARE-01 — registro emocional diario.
- WL-CLIN-04 — catálogo CIE-10.
- WL-SEC-03 — auditoría ampliada.
- WL-ADMIN-01 — consola administrativa mínima.

**Resultado de negocio:** WiseLife mejora el descubrimiento de especialistas, la continuidad del paciente y la supervisión operacional.

## Priorización para el Scrum Master

| Orden | Release | Prioridad | Criterio de planificación |
|---|---|---|---|
| 1 | Release 0 | Bloqueante | No iniciar historias dependientes hasta cerrar reglas, roles, seguridad y legal. |
| 2 | MVP-1 | Must Have / P0 | Entregar acceso y descubrimiento con controles de privacidad desde el inicio. |
| 3 | MVP-2 | Must Have / P0 | Entregar reserva, pago, agenda y atención clínica mínima. |
| 4 | MVP ampliado | Should Have / P1 | Planificar después de validar el flujo principal y los riesgos críticos. |
| 5 | Evolución posterior | Could Have | Evaluar con métricas reales y capacidad del equipo. |

## Dependencias entre historias

- WL-AUTH-01 a WL-AUTH-03 son prerequisito para todas las funciones privadas.
- WL-SEC-01 y WL-SEC-02 deben acompañar cualquier historia que cree o consulte datos de usuario.
- WL-PSY-01 y WL-PSY-02 son prerequisito de WL-DISC-01, WL-DISC-03 y WL-BOOK-01.
- WL-BOOK-01 es prerequisito de WL-BOOK-02.
- WL-BOOK-02 es prerequisito de WL-BOOK-03, WL-BOOK-04, WL-BOOK-05 y WL-OPS-01.
- WL-BOOK-03 es prerequisito para confirmar la cita según la política de pago.
- WL-CLIN-01 es prerequisito de WL-CLIN-02 y WL-CLIN-03.
- WL-CLIN-02 y WL-CLIN-03 son prerequisito para cerrar una sesión con documentación clínica.
- WL-NOTIF-01 depende de que estén definidos los estados y eventos de cita y pago.
- WL-ADMIN-01 depende de roles administrativos y auditoría mínima.

## Criterios de entrada por release

### Para iniciar MVP-1

- Reglas de autenticación y onboarding aprobadas.
- Roles y permisos definidos.
- Diseño de estados de perfil y disponibilidad aprobado.
- Políticas RLS y privacidad revisadas.
- Criterios de aceptación refinados y estimables.

### Para iniciar MVP-2

- MVP-1 validado en QA.
- Disponibilidad real y zona horaria confirmadas.
- Política de reserva, expiración y cancelación aprobada.
- Flujo de pago Nequi definido, incluyendo comprobación, duplicados y reembolsos.
- Diseño de historia clínica y consentimientos revisado por Legal y Seguridad.

### Para iniciar MVP ampliado

- MVP-2 validado con pruebas de flujo completo.
- Sin vulnerabilidades críticas o altas abiertas.
- Métricas iniciales de reserva, pago, cancelación e inasistencia disponibles.
- Capacidad operativa para soporte y administración definida.

## Criterios de salida del MVP

El MVP está listo para evaluación de lanzamiento cuando:

- El flujo paciente-registro-descubrimiento-reserva-pago-cita está probado end-to-end.
- El flujo psicólogo-disponibilidad-agenda-confirmación-cierre está probado end-to-end.
- Las historias clínicas solo son accesibles por usuarios autorizados.
- RLS, permisos, validaciones server-side y protección contra doble reserva están aprobados.
- Consentimientos, términos y tratamiento de datos tienen aprobación legal.
- QA ha ejecutado pruebas funcionales, regresión, permisos, concurrencia y errores.
- DevOps ha validado observabilidad, despliegue, rollback y variables de entorno.
- Existe documentación para soporte, operación y respuesta a incidentes.

## Fuera de alcance del MVP

No planificar en estos releases:

- Videollamadas propias.
- Chat clínico en tiempo real.
- Aplicación móvil nativa.
- Diagnóstico o recomendaciones mediante IA.
- Suscripciones y paquetes avanzados.
- Cuentas familiares.
- Integraciones con aseguradoras.
- Analítica clínica avanzada.

## Riesgos que deben permanecer visibles en cada Sprint

1. Exposición accidental de datos clínicos o personales.
2. Doble reserva por concurrencia.
3. Fraude, duplicidad o ambigüedad en comprobantes Nequi.
4. Acceso clínico por un psicólogo no autorizado.
5. Consentimientos o políticas no aprobados para Colombia.
6. Estados de cita y pago inconsistentes.
7. Fallos silenciosos en notificaciones y recordatorios.
8. Funciones de base de datos inseguras o con privilegios excesivos.

## Gobernanza del roadmap

- El Product Owner mantiene el alcance y la prioridad.
- El Scrum Master mantiene la trazabilidad de historias, dependencias, bloqueos y criterios de entrada.
- Arquitectura y Seguridad validan decisiones técnicas y controles de acceso.
- UX/UI valida los flujos críticos y estados de error, carga y vacío.
- QA valida criterios de aceptación y regresión.
- Legal valida consentimiento, historia clínica y tratamiento de datos.
- DevOps valida despliegue, observabilidad, rollback y continuidad operativa.

Cualquier cambio de alcance debe actualizar simultáneamente este documento y `PRODUCT_BACKLOG.md`.
## Referencias
`PRODUCT_BACKLOG.md`, `SPRINT_01.md`, `ARQUITECTURA.md`, `BASE_DATOS.md`, `API.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`, `DEVOPS.md`.
