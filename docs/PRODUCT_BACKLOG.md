# Product Backlog MVP — WiseLife

**Propósito:** documento operativo para el Scrum Master y el equipo de producto.

**Producto:** plataforma para encontrar, reservar y gestionar atención psicológica en Colombia.

**Alcance del MVP:** permitir que un paciente cree su cuenta, complete su perfil, encuentre un psicólogo, reserve y pague una sesión, y que el psicólogo gestione su agenda y la documentación clínica autorizada.

## Convenciones

- **Must Have:** imprescindible para liberar el MVP.
- **Should Have:** importante, pero puede liberarse después del núcleo.
- **Could Have:** aporta valor sin bloquear el MVP.
- **Won't Have:** explícitamente fuera del MVP.
- Cada historia debe refinarse con el equipo antes de entrar a un Sprint.
- Las historias clínicas, pagos y permisos requieren validación de Seguridad, QA, Legal y DevOps antes de aprobarse.

## Épicas y backlog priorizado

### Módulo 1 — Identidad y acceso

#### Épica 1.1 — Registro e inicio de sesión

| ID | Historia de usuario | MoSCoW | Prioridad | Criterios de aceptación resumidos |
|---|---|---|---|---|
| WL-AUTH-01 | Como paciente, quiero crear una cuenta para acceder a servicios personalizados. | Must | P0 | Registro con correo y contraseña; validación; confirmación de correo; mensajes que no enumeren cuentas; acceso privado protegido. |
| WL-AUTH-02 | Como usuario registrado, quiero iniciar sesión para acceder a mi espacio privado. | Must | P0 | Credenciales válidas; error genérico ante credenciales inválidas; redirección según rol y onboarding; rutas privadas protegidas. |
| WL-AUTH-03 | Como usuario, quiero cerrar sesión y recuperar mi contraseña para controlar mi acceso. | Must | P0 | Cierre de sesión efectivo; recuperación por correo; enlaces expirados gestionados claramente. |

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

### MVP-1 — Acceso y descubrimiento

WL-AUTH-01 a WL-AUTH-03, WL-PROF-01, WL-PSY-01, WL-PSY-02, WL-DISC-01 y WL-DISC-03.

**Resultado esperado:** un paciente puede crear su cuenta y encontrar un psicólogo con perfil y disponibilidad válidos.

### MVP-2 — Reserva y operación

WL-BOOK-01 a WL-BOOK-05, WL-OPS-01 a WL-OPS-03 y WL-NOTIF-01.

**Resultado esperado:** el paciente puede reservar, reportar pago y gestionar su cita; el psicólogo puede operar su agenda.

### MVP-3 — Operación clínica segura

WL-CLIN-01 a WL-CLIN-04, WL-SEC-01 a WL-SEC-03 y WL-ADMIN-01.

**Resultado esperado:** WiseLife puede operar atención clínica con controles de acceso, trazabilidad y administración mínima.

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
