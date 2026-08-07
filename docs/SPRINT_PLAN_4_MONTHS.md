# Planificación Scrum de cuatro meses — WiseLife

## 1. Propósito y alcance

Este documento convierte el Product Backlog oficial de WiseLife en una planificación inicial de cuatro meses con sprints de dos semanas. El periodo se organiza en **8 sprints consecutivos**; como el backlog no define una fecha de inicio, las fechas calendario deberán establecerse durante el primer Sprint Planning.

El objetivo del periodo es avanzar desde el acceso y el descubrimiento hasta una operación clínica segura del MVP, respetando el alcance, prioridades y riesgos definidos en [`PRODUCT_BACKLOG.md`](./PRODUCT_BACKLOG.md).

## 2. Objetivo de producto para los cuatro meses

Entregar una base operativa del MVP que permita a un paciente registrarse, completar su perfil, encontrar un psicólogo, consultar disponibilidad, reservar y gestionar una cita; y que permita al psicólogo administrar su perfil, disponibilidad, agenda, pagos reportados y documentación clínica autorizada, con controles de acceso, consentimiento y trazabilidad.

La liberación del MVP queda condicionada a la validación de Seguridad, QA, Legal y DevOps en las historias de mayor riesgo, especialmente pagos, permisos e historias clínicas.

## 3. Cadencia Scrum por sprint

Cada sprint dura dos semanas:

- **Sprint Planning:** inicio del sprint; se confirma el objetivo, historias comprometidas, capacidad, dependencias y riesgos.
- **Daily Scrum:** durante los días de trabajo del sprint, según la dinámica acordada por el equipo.
- **Refinamiento:** durante el sprint; prepara historias candidatas para el siguiente Planning y verifica la Definition of Ready.
- **Sprint Review:** cierre del sprint; se inspecciona el incremento con Product Owner y stakeholders y se actualiza el backlog.
- **Retrospectiva:** después de la Review; se acuerda al menos una mejora accionable para el sprint siguiente.

El compromiso de un sprint no reemplaza el refinamiento: cualquier historia no lista debe regresar al backlog para preparación.

## 4. Plan de sprints

### Sprint 1 — Acceso seguro y base del paciente

**Objetivo:** habilitar el acceso protegido y el inicio del onboarding del paciente.

**Historias:**

- WL-AUTH-01 — Registro de cuenta del paciente.
- WL-AUTH-02 — Inicio de sesión y redirección según rol/onboarding.
- WL-AUTH-03 — Cierre de sesión y recuperación de contraseña.
- WL-PROF-01 — Completar datos básicos del paciente.

**Entregables:**

- Flujo de registro, confirmación de correo, inicio y cierre de sesión.
- Recuperación de contraseña con tratamiento seguro de enlaces expirados.
- Rutas privadas protegidas y redirección según rol y estado de onboarding.
- Primer flujo de perfil con validación y guardado de progreso.

**Criterios de finalización:**

- Todas las historias cumplen sus criterios de aceptación del Product Backlog.
- Se verifican accesos permitidos y denegados, incluyendo mensajes que no enumeren cuentas.
- El progreso del perfil se conserva y puede retomarse por el mismo usuario.
- Pruebas funcionales, regresión y revisión de seguridad aprobadas.
- El incremento se demuestra en la Sprint Review y las incidencias críticas están cerradas.

### Sprint 2 — Perfiles profesionales y catálogo

**Objetivo:** permitir que psicólogos completen su información y que pacientes encuentren profesionales válidos.

**Historias:**

- WL-PROF-02 — Editar información personal del paciente.
- WL-PSY-01 — Registrar información profesional del psicólogo.
- WL-PSY-02 — Configurar disponibilidad del psicólogo.
- WL-DISC-01 — Consultar psicólogos activos.
- WL-DISC-03 — Consultar el perfil profesional.

**Entregables:**

- Edición de perfil del paciente y avatar con aislamiento por propietario.
- Perfil profesional con licencia, formación, experiencia, especialidades, modalidad, idiomas y tarifa.
- Estado de perfil pendiente hasta cumplir requisitos.
- Disponibilidad con franjas, bloqueos, prevención de solapamientos y zona horaria Bogotá.
- Catálogo y detalle que solo muestran profesionales activos y completos.

**Criterios de finalización:**

- Solo perfiles profesionales activos y completos aparecen en el catálogo.
- El psicólogo puede crear, editar y eliminar sus franjas sin solapamientos.
- El paciente solo ve información profesional necesaria, nunca datos privados innecesarios.
- Se cubren estados de carga, error y lista vacía.
- QA, UX/UI, Seguridad y DevOps validan el incremento según el riesgo.

### Sprint 3 — Disponibilidad, reserva y protección contra concurrencia

**Objetivo:** permitir que el paciente seleccione una franja futura y cree una reserva segura.

**Historias:**

- WL-BOOK-01 — Consultar horarios disponibles.
- WL-BOOK-02 — Reservar una franja.
- WL-OPS-01 — Consultar la agenda profesional.

**Entregables:**

- Consulta de horarios futuros, libres y no bloqueados.
- Creación de reserva vinculada a paciente y psicólogo.
- Estado `pendiente_pago` y expiración configurada.
- Protección contra doble reserva.
- Agenda del psicólogo con vistas día, semana y mes, estados de cita y pago, y experiencia móvil.

**Criterios de finalización:**

- La duración y zona horaria de cada franja son correctas.
- Dos intentos concurrentes no pueden confirmar la misma franja.
- La reserva queda vinculada a las partes correctas y expira según la regla definida.
- El psicólogo visualiza únicamente los datos mínimos necesarios del paciente.
- Se prueban casos futuros, bloqueados, ocupados, expirados y de error.

### Sprint 4 — Pagos reportados y consulta de citas

**Objetivo:** completar el flujo de pago reportado y dar visibilidad del ciclo de vida de las citas.

**Historias:**

- WL-BOOK-03 — Reportar pago para confirmar la reserva.
- WL-BOOK-04 — Consultar citas próximas e históricas.
- WL-OPS-02 — Aprobar o rechazar pagos reportados.

**Entregables:**

- Visualización de monto y método de pago.
- Registro de referencia de pago y auditoría de la decisión.
- Estados independientes y coherentes de pago y cita.
- Aprobación o rechazo por parte del psicólogo.
- Listado de citas futuras, completadas y canceladas para el paciente.

**Criterios de finalización:**

- Las inconsistencias de monto o referencia pueden rechazarse y quedan registradas.
- El paciente y el psicólogo ven estados consistentes con sus permisos.
- El paciente solo consulta sus propias citas, con profesional, fecha, modalidad y monto.
- Se prueban duplicados, rechazo, aprobación, referencia inválida y reintentos.
- Pagos y datos sensibles cuentan con validación server-side, auditoría y revisión de Seguridad/QA.

### Sprint 5 — Cancelación, cierre de sesión y núcleo clínico

**Objetivo:** completar el ciclo básico de la cita y habilitar la documentación clínica autorizada.

**Historias:**

- WL-BOOK-05 — Cancelar una cita.
- WL-OPS-03 — Marcar una sesión como completada con nota clínica.
- WL-CLIN-01 — Crear historia clínica autorizada.
- WL-CLIN-02 — Registrar evolución de cada sesión.

**Entregables:**

- Cancelación con confirmación, reglas de anticipación y liberación de franja.
- Registro del actor y efectos sobre el pago.
- Historia clínica con motivo de consulta y consentimientos.
- Notas vinculadas a citas, con borrador y finalización.
- Cierre de sesión como completada y manejo de inasistencia.

**Criterios de finalización:**

- Una cita cancelada aplica las reglas definidas y conserva trazabilidad.
- Una sesión no puede cerrarse sin los requisitos clínicos y consentimientos aplicables.
- Existe como máximo una nota final por cita y una nota finalizada queda protegida.
- Autor, paciente, cita y fechas quedan registrados.
- Legal, Seguridad, QA y DevOps aprueban el tratamiento de información clínica antes de aceptar el incremento.

### Sprint 6 — Consulta clínica, autorización y controles de datos

**Objetivo:** asegurar que la información clínica solo sea accesible por actores autorizados y completar los controles de privacidad del MVP.

**Historias:**

- WL-CLIN-03 — Consultar historia clínica autorizada.
- WL-SEC-01 — Controlar acceso por rol y propietario.
- WL-SEC-02 — Gestionar consentimiento para tratamiento de datos.
- WL-SEC-03 — Auditar acciones sensibles.

**Entregables:**

- Consulta cronológica de historias solo por el psicólogo tratante autorizado.
- Reglas de aislamiento por usuario y rol y pruebas de permitido/denegado.
- Términos y privacidad visibles, con consentimiento versionado y fechado.
- Bloqueo de atención cuando falten consentimientos requeridos.
- Registro de actor, fecha, entidad y acción para operaciones sensibles.

**Criterios de finalización:**

- Las políticas de RLS y permisos están revisadas y las pruebas negativas no permiten acceso indebido.
- No se pueden reasignar propietarios ni consultar historias ajenas.
- El consentimiento conserva versión y fecha y puede demostrarse en auditoría.
- La auditoría no puede ser modificada por usuarios comunes y su retención está definida.
- Seguridad, Legal, QA y DevOps firman la aceptación del incremento.

### Sprint 7 — Capacidades Should Have y operación administrativa

**Objetivo:** ampliar el MVP con capacidades operativas prioritarias sin comprometer el núcleo seguro.

**Historias:**

- WL-DISC-02 — Filtrar especialistas.
- WL-BOOK-06 — Reprogramar una cita.
- WL-CARE-01 — Registrar estado emocional diario.
- WL-CLIN-04 — Seleccionar diagnósticos desde catálogo CIE-10.
- WL-ADMIN-01 — Gestionar usuarios, psicólogos, citas y pagos.

**Entregables:**

- Filtros por especialidad y modalidad con limpieza y resultados consistentes.
- Reprogramación con nueva franja libre, historial y reglas aplicables.
- Registro emocional diario privado, con nota opcional y aclaración de uso no diagnóstico.
- Búsqueda CIE-10 por código o descripción, sin diagnóstico automático.
- Consola administrativa con acceso restringido, revisión de profesionales, consulta operativa, suspensión y auditoría.

**Criterios de finalización:**

- Cada capacidad cumple sus criterios de aceptación y no altera las reglas P0.
- La reprogramación conserva el historial de la cita original y notifica cuando corresponda.
- Los datos emocionales y diagnósticos se aíslan correctamente.
- La consola administrativa no está disponible para pacientes ni psicólogos sin autorización.
- Se completan pruebas de regresión sobre registro, reserva, pagos, permisos e historias clínicas.

### Sprint 8 — Notificaciones, estabilización y preparación de release

**Objetivo:** preparar una versión candidata del MVP, cerrar riesgos críticos y validar la operación de extremo a extremo.

**Historias:**

- WL-NOTIF-01 — Recibir confirmaciones y recordatorios.
- Historias P0 pendientes identificadas durante los Sprints 1–7, solo si cumplen Definition of Ready.
- Correcciones y tareas de calidad derivadas de Reviews, retrospectivas, QA, Seguridad, Legal y DevOps.

**Entregables:**

- Notificaciones de alta, confirmación, cancelación y reprogramación.
- Recordatorio previo y registro de errores de envío.
- Recorrido de aceptación de extremo a extremo: registro, onboarding, descubrimiento, reserva, pago, agenda y cierre clínico.
- Matriz de trazabilidad entre historias, criterios, pruebas y aprobaciones.
- Lista de riesgos residuales, decisiones pendientes y recomendación de release.

**Criterios de finalización:**

- Las notificaciones tienen plantillas, reintentos y preferencias definidos según las decisiones del producto.
- No quedan defectos críticos o altos abiertos para el MVP.
- Todas las historias Must Have están aceptadas o tienen una decisión explícita del Product Owner.
- La Definition of Done del backlog se cumple para cada incremento liberable.
- Product Owner acepta el incremento en la Sprint Review y el equipo deja documentado el plan de operación y soporte.

## 5. Definition of Ready para ingresar a un sprint

Ninguna historia entra comprometida a un Sprint Planning si no tiene:

- objetivo y usuario claros;
- criterios de aceptación verificables;
- dependencias y riesgos identificados;
- diseño UX/UI disponible cuando aplique;
- reglas de negocio, datos, estados y permisos definidos;
- riesgos de seguridad y privacidad revisados;
- estimación del equipo;
- condición de prueba conocida.

## 6. Definition of Done para historias e incrementos

Una historia o incremento se considera terminado cuando:

- cumple todos los criterios de aceptación;
- tiene pruebas funcionales y de regresión aprobadas;
- respeta permisos, RLS y validaciones server-side;
- no expone datos clínicos ni credenciales;
- funciona en móvil y escritorio cuando corresponda;
- contempla carga, vacío y error;
- está documentado para soporte y operación;
- pasa las revisiones de Arquitectura, UX/UI, QA, Seguridad y DevOps según el riesgo;
- queda trazable en el historial de cambios.

## 7. Priorización y gestión del alcance

1. **Primero:** todas las historias Must Have y los controles P0 necesarios para que el MVP sea seguro y operable.
2. **Después:** historias Should Have en los Sprints 7 y 8, siempre que no desplacen historias P0 ni la estabilización.
3. **Condicional:** una historia Should Have puede regresar al backlog si no está lista, aumenta el riesgo clínico/legal o compromete la calidad del MVP.
4. **Fuera del periodo:** las historias Could Have y todo el alcance Won't Have permanecen fuera de esta planificación, salvo decisión formal del Product Owner.

Los riesgos de pagos Nequi, concurrencia, historias clínicas, roles, notificaciones, disponibilidad, seguridad Supabase y criterios legales deben revisarse en cada Planning, Review y Retrospectiva mientras sigan abiertos.

## 8. Resultado esperado al finalizar los cuatro meses

WiseLife deberá contar con un incremento candidato a MVP que cubra el flujo principal paciente-psicólogo y sus controles de seguridad, con evidencia de pruebas, auditoría, consentimiento, operación y decisiones de release. La liberación no se considera aprobada únicamente por completar los ocho sprints: requiere aceptación del Product Owner y las validaciones obligatorias definidas en el Product Backlog.
