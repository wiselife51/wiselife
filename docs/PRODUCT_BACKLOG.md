# PRODUCT_BACKLOG.md — WiseLife

**Propósito:** producto, épicas, historias, prioridades y criterios de aceptación.
**Responsable:** Product Owner. **Estado:** Requiere validación de Producto, Seguridad, QA y Legal.

## Alcance MVP
Plataforma colombiana para que pacientes creen su cuenta, completen su perfil, encuentren un psicólogo, reserven y reporten el pago de una sesión; el psicólogo gestiona disponibilidad, agenda y documentación clínica autorizada.

## Épicas priorizadas

| Módulo | Historias principales | Prioridad |
|---|---|---|
| Identidad y acceso | Registro, login, logout, recuperación y callback | P0 Must |
| Perfiles | Onboarding y edición de paciente; onboarding profesional | P0 Must |
| Descubrimiento | Catálogo, filtros, perfil y disponibilidad | P0/P1 |
| Agenda y pagos | Reserva atómica, estados, reporte de pago, cancelación | P0 Must |
| Operación profesional | Agenda, bloqueos, aprobación de pagos y cierre de sesión | P0 Must |
| Experiencia clínica | Historia, notas de evolución y CIE-10 | P0/P1 |
| Seguridad y cumplimiento | RLS, consentimientos y auditoría | P0/P1 |
| Notificaciones y administración | Recordatorios y consola administrativa | P1 Should |

- **Must Have:** imprescindible para liberar el MVP.
- **Should Have:** importante, pero puede liberarse después del núcleo.
- **Could Have:** aporta valor sin bloquear el MVP.
- **Won't Have:** explícitamente fuera del MVP.
- Cada historia debe refinarse con el equipo antes de entrar a un Sprint.
- Las historias clínicas, pagos y permisos requieren validación de Seguridad, QA, Legal y DevOps antes de aprobarse.
- Seguridad, privacidad, autorización, RLS y trazabilidad son dependencias transversales desde MVP-1; no se posponen a una fase posterior.
- MVP inicial incluye el núcleo operativo y los controles mínimos obligatorios; MVP ampliado contiene capacidades importantes que no bloquean la primera liberación.

## Criterios de aceptación transversales
- Validación de entradas, estados de carga/error/vacío y persistencia comprobable.
- Aislamiento por usuario, rol y relación profesional-paciente mediante RLS.
- Doble reserva, pagos duplicados, reintentos e idempotencia controlados en servidor.
- Datos clínicos fuera de logs, analytics y respuestas no autorizadas.
- Pruebas funcionales, negativas, accesibilidad y responsive antes de Done.

## MVP Must Have
Autenticación, perfiles, disponibilidad, catálogo, reserva, pago reportado, citas, agenda profesional, historia clínica, notas, permisos, RLS y consentimiento.

## MVP ampliado
Filtros avanzados, reprogramación, diario emocional, CIE-10, notificaciones, auditoría y administración.

## Fuera de alcance
Videollamadas propias, chat en tiempo real, app nativa, diagnóstico/recomendaciones clínicas mediante IA, suscripciones, cuentas familiares e integraciones empresariales.

## Decisiones pendientes `[POR DEFINIR]`
- Comprobación, expiración, fraude y reembolso de pagos Nequi — **Responsable:** Product Owner + Finanzas/Legal.
- Política de cancelación, anticipación y duración — **Responsable:** Product Owner.
- Retención, exportación y corrección de historias clínicas — **Responsable:** Legal + Seguridad.
- Roles definitivos y permisos administrativos — **Responsable:** Arquitecto de Seguridad.
- Proveedor y plantillas de notificaciones — **Responsable:** Product Owner + DevOps.

### Módulo 2 — Onboarding y perfiles

#### Épica 2.1 — Perfil del paciente

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-PROF-01 | Como paciente, quiero completar mis datos básicos para recibir una experiencia personalizada. | Must | P0 | Campos obligatorios validados; progreso guardado por usuario; posibilidad de retomar el proceso. |
| WL-PROF-02 | Como paciente, quiero editar mi información personal para mantenerla vigente. | Must | P0 | Edición de datos personales y avatar; solo el propietario puede modificar; persistencia comprobable. |

#### Épica 2.2 — Onboarding del psicólogo

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-PSY-01 | Como psicólogo, quiero registrar mi información profesional para ofrecer mis servicios. | Must | P0 | Licencia, formación, experiencia, especialidades, modalidad, idiomas y tarifa; perfil pendiente hasta cumplir requisitos. |
| WL-PSY-02 | Como psicólogo, quiero configurar mi disponibilidad para que los pacientes puedan reservar. | Must | P0 | Franjas creadas, editadas y eliminadas; sin solapamientos; bloqueos respetados; zona horaria Bogotá. |

### Módulo 3 — Descubrimiento y selección

#### Épica 3.1 — Catálogo de especialistas

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-DISC-01 | Como paciente, quiero consultar psicólogos activos para elegir un profesional. | Must | P0 | Solo perfiles activos y completos; información esencial; estados de carga, error y lista vacía. |
| WL-DISC-02 | Como paciente, quiero filtrar especialistas para encontrar una opción adecuada más rápido. | Should | P1 | Filtros por especialidad y modalidad; limpieza de filtros; resultados consistentes. |
| WL-DISC-03 | Como paciente, quiero consultar el perfil profesional para decidir si agendo. | Must | P0 | Credenciales, experiencia, especialidades, modalidad, tarifa y disponibilidad; sin datos privados innecesarios. |
| WL-DISC-04 | Como paciente, quiero guardar especialistas favoritos para revisarlos después. | Could | P2 | Alta, baja y consulta de favoritos por usuario; aislamiento de datos entre usuarios. |

### Módulo 4 — Citas, agenda y pagos

#### Épica 4.1 — Reserva y ciclo de vida de citas

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-BOOK-01 | Como paciente, quiero consultar horarios disponibles para elegir mi sesión. | Must | P0 | Solo horarios futuros, libres y no bloqueados; duración y zona horaria correctas. |
| WL-BOOK-02 | Como paciente, quiero reservar una franja para iniciar el agendamiento. | Must | P0 | Reserva vinculada a paciente y psicólogo; protección contra doble reserva; estado `pendiente_pago`; expiración configurada. |
| WL-BOOK-03 | Como paciente, quiero reportar mi pago para confirmar mi reserva. | Must | P0 | Monto y método visibles; referencia registrada; aprobación o rechazo por psicólogo; estados de pago y cita separados; auditoría. |
| WL-BOOK-04 | Como paciente, quiero ver mis citas próximas e históricas para organizar mi proceso. | Must | P0 | Citas futuras, completadas y canceladas; estado, profesional, fecha, modalidad y monto; solo datos propios. |
| WL-BOOK-05 | Como usuario, quiero cancelar una cita para gestionar cambios de agenda. | Must | P0 | Confirmación; reglas de anticipación; liberación de franja; registro de actor y efectos de pago. |
| WL-BOOK-06 | Como paciente, quiero reprogramar una cita para mantener mi proceso. | Should | P1 | Nueva franja libre; historial de la cita original; notificación a ambas partes; reglas de reprogramación. |

#### Épica 4.2 — Operación de agenda profesional

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-OPS-01 | Como psicólogo, quiero consultar mi agenda para organizar mis sesiones. | Must | P0 | Vistas día, semana y mes; estados de pago y cita; datos mínimos del paciente; experiencia móvil. |
| WL-OPS-02 | Como psicólogo, quiero aprobar o rechazar pagos reportados para confirmar citas. | Must | P0 | Referencia y monto visibles; cambios auditados; inconsistencias rechazadas; estados coherentes. |
| WL-OPS-03 | Como psicólogo, quiero marcar una sesión como completada con su nota clínica. | Must | P0 | Requisitos clínicos cumplidos; estado `completada`; trazabilidad; manejo de inasistencia. |

### Módulo 5 — Experiencia terapéutica

#### Épica 5.1 — Seguimiento del paciente

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-CARE-01 | Como paciente, quiero registrar mi estado emocional diario para observar mi evolución. | Should | P1 | Un registro por día; nota opcional; datos privados; aclaración de que no es diagnóstico. |
| WL-CARE-02 | Como paciente, quiero consultar mi historial emocional para identificar patrones. | Could | P2 | Consulta por fecha o rango; solo registros propios; advertencia de uso no clínico. |

#### Épica 5.2 — Historia clínica

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-CLIN-01 | Como psicólogo autorizado, quiero crear la historia clínica para documentar la atención. | Must | P0 | Contexto autorizado; motivo de consulta y consentimientos; campos validados; autor, paciente y fecha registrados. |
| WL-CLIN-02 | Como psicólogo, quiero registrar la evolución de cada sesión para mantener continuidad clínica. | Must | P0 | Nota vinculada a cita; borrador y finalización; una nota final por cita; protección tras finalizar; autoría y fecha. |
| WL-CLIN-03 | Como psicólogo tratante, quiero consultar la historia autorizada para tomar decisiones informadas. | Must | P0 | Acceso solo del profesional autorizado; orden cronológico; auditoría cuando corresponda; sin historias ajenas. |
| WL-CLIN-04 | Como psicólogo, quiero seleccionar diagnósticos desde un catálogo CIE-10 para registrar información consistente. | Should | P1 | Búsqueda por código o descripción; códigos válidos; diagnóstico primario y secundarios; no diagnóstico automático. |

### Módulo 6 — Seguridad, cumplimiento y operación

#### Épica 6.1 — Protección y cumplimiento

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-SEC-01 | Como responsable de seguridad, quiero que cada rol acceda solo a información autorizada. | Must | P0 | RLS en tablas expuestas; aislamiento por usuario y rol; sin reasignación de propietarios; pruebas de permitido y denegado. |
| WL-SEC-02 | Como paciente, quiero conocer y aceptar el tratamiento de mis datos. | Must | P0 | Términos y privacidad visibles; consentimiento con fecha y versión; bloqueo de atención sin consentimientos requeridos; revisión legal colombiana. |
| WL-SEC-03 | Como responsable de cumplimiento, quiero auditar acciones sensibles. | Should | P1 | Actor, fecha, entidad y acción; auditoría no editable por usuarios comunes; retención definida. |

#### Épica 6.2 — Notificaciones

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-NOTIF-01 | Como usuario, quiero recibir confirmaciones y recordatorios para no olvidar mis sesiones. | Should | P1 | Alta, confirmación, cancelación y reprogramación notificadas; recordatorio previo; errores de envío registrados. |

#### Épica 6.3 — Administración

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-ADMIN-01 | Como administrador, quiero gestionar usuarios, psicólogos, citas y pagos para operar la plataforma. | Should | P1 | Acceso solo administrativo; revisión de profesionales; consulta de citas y transacciones; suspensión; auditoría. |

## Resumen MoSCoW

### Must Have — Release MVP

- Autenticación y recuperación de acceso.
- Onboarding y perfil del paciente.
- Perfil profesional y disponibilidad del psicólogo.
- Catálogo y perfil del especialista.
- Consulta de horarios y reserva atómica.
- Reporte y validación de pagos.
- Mis citas, cancelación y agenda profesional.
- Historia clínica, notas de evolución y cierre de sesión.
- Autorización por rol, RLS y consentimientos de privacidad.

### Should Have — MVP ampliado

- Filtros avanzados.
- Reprogramación.
- Seguimiento emocional.
- CIE-10.
- Notificaciones y recordatorios.
- Auditoría.
- Consola administrativa.

### Could Have

- Favoritos.
- Historial visual del estado emocional.
- Paquetes.
- Referidos automatizados.
- Preferencias avanzadas de notificación.

### Won't Have — Fuera del MVP

- Videollamadas propias.
- Chat clínico en tiempo real.
- Aplicación móvil nativa.
- Recomendaciones o diagnóstico mediante IA.
- Suscripciones.
- Cuentas familiares.
- Integraciones con aseguradoras.
- Analítica clínica avanzada.

## Roadmap sugerido

### MVP-1 — Acceso, descubrimiento y controles base

WL-AUTH-01 a WL-AUTH-03, WL-PROF-01, WL-PSY-01, WL-PSY-02, WL-DISC-01 y WL-DISC-03.

**Controles obligatorios transversales:** WL-SEC-01 y WL-SEC-02 deben estar implementados antes de exponer datos de usuario, perfiles, disponibilidad o reservas. WL-SEC-03 se incorpora cuando existan acciones clínicas o administrativas auditables.

**Resultado esperado:** un paciente puede crear su cuenta y encontrar un psicólogo con perfil y disponibilidad válidos, con acceso protegido y consentimiento gestionado.

### MVP-2 — Reserva y operación clínica mínima

WL-BOOK-01 a WL-BOOK-05, WL-OPS-01 a WL-OPS-03, WL-CLIN-01 a WL-CLIN-03 y WL-NOTIF-01.

**Resultado esperado:** el paciente puede reservar, reportar pago y gestionar su cita; el psicólogo puede operar su agenda y documentar la atención autorizada.

### MVP ampliado — Capacidades de soporte y control

WL-DISC-02, WL-BOOK-06, WL-CARE-01, WL-CLIN-04, WL-SEC-03 y WL-ADMIN-01.

**Resultado esperado:** WiseLife mejora descubrimiento, continuidad, auditoría y operación administrativa sin bloquear la primera liberación del núcleo.

### Fuera del MVP inicial

WL-DISC-04 y WL-CARE-02, además de todas las funcionalidades indicadas en “Won't Have”. Se incorporarán únicamente después de validar el núcleo operativo, la seguridad y el cumplimiento.

## Definición de Ready para un Sprint

Una historia está lista para planificación cuando tiene:

- objetivo y usuario claramente definidos;
- criterios de aceptación verificables;
- dependencias identificadas;
- diseño UX/UI disponible cuando aplique;
- reglas de negocio documentadas;
- riesgos de seguridad y privacidad revisados;
- datos, estados y permisos definidos;
- estimación del equipo;
- condición de prueba conocida.

## Definición de Done del MVP

Una historia se considera terminada cuando:

- cumple todos sus criterios de aceptación;
- tiene pruebas funcionales y de regresión aprobadas;
- respeta permisos, RLS y validaciones server-side;
- no expone datos clínicos o credenciales;
- funciona en móvil y escritorio cuando corresponda;
- cuenta con manejo de carga, vacío y error;
- está documentada para soporte y operación;
- pasa revisión de Arquitectura, UX/UI, QA, Seguridad y DevOps según el riesgo;
- queda trazable en el historial de cambios.

## Riesgos y decisiones pendientes

1. **Pagos Nequi:** definir comprobación, expiración, duplicados, fraude, reembolsos y responsable de aprobación.
2. **Concurrencia:** garantizar que una franja no pueda reservarse dos veces.
3. **Historias clínicas:** validar retención, acceso, exportación, corrección y eliminación según normativa colombiana.
4. **Roles:** formalizar roles de paciente, psicólogo, administrador y soporte.
5. **Notificaciones:** definir proveedor, plantillas, reintentos y preferencias.
6. **Disponibilidad:** definir duración de sesión, anticipación mínima y política de cancelación.
7. **Seguridad Supabase:** corregir exposición innecesaria de tablas y funciones con `search_path` mutable antes de producción.
8. **Criterios legales:** aprobar consentimiento informado, tratamiento de datos y términos del servicio.

## Fuera de alcance confirmado

No se debe planificar para el MVP videollamadas propias, chat en tiempo real, aplicación móvil nativa, IA clínica, suscripciones, cuentas familiares ni integraciones empresariales.

## Referencias
`ROADMAP.md`, `SPRINT_01.md`, `ARQUITECTURA.md`, `BASE_DATOS.md`, `API.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`.
