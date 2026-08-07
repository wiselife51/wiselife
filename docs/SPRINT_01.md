# Sprint 1 — Fundaciones de acceso y seguridad

**Producto:** WiseLife
**Estado:** Aprobado para planificación; no representa evidencia de construcción o finalización.
**Responsable de producto:** Product Owner
**Facilitación:** Scrum Master
**Duración:** 2 semanas
**Fechas:** `[POR DEFINIR]` antes de iniciar el Sprint
**Capacidad comprometida:** Baja, máximo 8 puntos de historia

## Objetivo del Sprint

Dejar preparada la base segura de WiseLife para que pacientes y psicólogos puedan acceder al producto, completar los datos mínimos de sus perfiles y operar bajo controles explícitos de autenticación, autorización, privacidad y RLS.

El Sprint no incluye catálogo público, disponibilidad, reservas, pagos, historia clínica ni notificaciones. Esas funcionalidades dependen de esta fundación y se planificarán posteriormente.

## Alcance comprometido

| Orden | ID | Historia | Prioridad | Puntos | Criterios de aceptación específicos |
|---:|---|---|---|---:|---|
| 1 | WL-AUTH-01 | Como paciente, quiero crear una cuenta para acceder a servicios personalizados. | P0 Must | Por estimar | Registro con correo y contraseña; validación de formato y contraseña; confirmación de correo según política; mensajes que no enumeren cuentas; no acceso privado sin sesión válida. |
| 2 | WL-AUTH-02 | Como usuario registrado, quiero iniciar sesión para acceder a mi espacio privado. | P0 Must | Por estimar | Credenciales válidas permiten acceso; credenciales inválidas muestran mensaje genérico; redirección según rol/onboarding; rutas privadas bloquean anónimos; sesión gestionada de forma segura. |
| 3 | WL-AUTH-03 | Como usuario, quiero cerrar sesión y recuperar mi contraseña para controlar mi acceso. | P0 Must | Por estimar | Cierre de sesión invalida el acceso; recuperación por correo; enlaces expirados tienen respuesta clara; rutas privadas no quedan accesibles tras cerrar sesión. |
| 4 | WL-PROF-01 | Como paciente, quiero completar mis datos básicos para recibir una experiencia personalizada. | P0 Must | Por estimar | Campos obligatorios validados; datos vinculados al usuario autenticado; progreso persistente; posibilidad de retomar el proceso; no acceso a datos de otro usuario. |
| 5 | WL-PSY-01 | Como psicólogo, quiero registrar mi información profesional para ofrecer servicios. | P0 Must | Por estimar | Licencia, formación, experiencia, especialidades, modalidad, idiomas y tarifa validados; perfil incompleto no se publica; estado pendiente hasta cumplir requisitos; datos protegidos por rol. |
| 6 | WL-SEC-01 | Como responsable de seguridad, quiero que cada rol acceda solo a información autorizada. | P0 Must | Por estimar | RLS habilitado en tablas expuestas; paciente, psicólogo y administrador con permisos diferenciados; no reasignación de propietario; pruebas positivas y negativas; datos clínicos y privados no visibles a anónimos. |
| 7 | WL-SEC-02 | Como paciente, quiero conocer y aceptar el tratamiento de mis datos. | P0 Must | Por estimar | Términos y privacidad visibles; consentimiento guarda fecha, versión y usuario; consentimiento requerido antes de atención; no aceptación no permite avanzar a flujos protegidos; textos pendientes de aprobación legal colombiana. |

**Regla de capacidad:** las historias se mantienen comprometidas solo si la estimación total no supera 8 puntos. Si exceden la capacidad, el Scrum Master debe devolver historias al Product Backlog siguiendo el orden de prioridad, sin retirar WL-SEC-01 ni WL-SEC-02.

## Orden de ejecución

1. Confirmar roles, permisos, estados de onboarding y reglas de sesión.
2. Implementar y validar registro, callback, inicio, cierre y recuperación de acceso.
3. Implementar perfil mínimo del paciente.
4. Implementar onboarding y estado de aprobación del psicólogo.
5. Aplicar RLS y pruebas de acceso permitido/denegado.
6. Incorporar consentimientos y bloqueo de flujos sin aceptación.
7. Ejecutar pruebas integrales, revisión de seguridad y documentación.

## Roles y permisos aprobados para este Sprint

| Rol | Puede hacer | No puede hacer |
|---|---|---|
| Anónimo | Consultar únicamente contenido público definido. | Leer o modificar perfiles privados, onboarding, consentimientos o datos clínicos. |
| Paciente | Gestionar su cuenta, su perfil y sus consentimientos. | Leer o modificar datos de otros pacientes o perfiles profesionales no autorizados. |
| Psicólogo | Gestionar su cuenta y su perfil profesional propio. | Leer o modificar perfiles privados de pacientes o datos clínicos sin autorización explícita. |
| Administrador | Acceder a funciones administrativas solo bajo permisos definidos y auditados. | Usar privilegios sin trazabilidad o saltarse controles de auditoría. |
| Soporte | No tiene acceso clínico por defecto; atiende incidencias con datos mínimos. | Consultar historias clínicas o cambiar permisos sin autorización formal. |

Los roles administrativos y de soporte quedan sujetos a la definición final de permisos y auditoría antes de habilitar funciones operativas. Ningún rol puede usar `user_metadata` como fuente de autorización.

## Dependencias y bloqueadores

- Política de confirmación de correo y recuperación de contraseña.
- Definición técnica de roles y matriz de permisos.
- Políticas RLS revisadas por Seguridad.
- Textos de privacidad, términos y consentimiento aprobados por Legal.
- Criterios de estados de onboarding de paciente y psicólogo.
- Datos sintéticos para QA; nunca usar datos clínicos reales.

## Criterios de entrada

- Historias refinadas y estimables.
- Diseños o flujos UX disponibles para estados principales.
- Reglas de negocio y permisos documentados.
- Ambiente de preview/integración disponible.
- Casos de prueba de autenticación, RLS y privacidad preparados.

## Criterios de salida

- 100% de historias comprometidas aceptadas por el Product Owner.
- Cero vulnerabilidades críticas o altas abiertas.
- Pruebas de autenticación, sesión, RLS, BOLA/IDOR y privacidad aprobadas.
- Casos de error, carga, vacío, reintento, accesibilidad y responsive verificados.
- Documentación de backlog, roadmap y Sprint actualizada.
- Evidencia trazable de QA, revisión de Seguridad y decisión de aceptación.

## Métricas de éxito

- 100% de historias comprometidas aceptadas.
- 0 vulnerabilidades críticas o altas abiertas al cierre.
- 100% de casos P0 de autenticación y RLS aprobados.
- 100% de decisiones de roles, permisos y consentimientos documentadas.
- 100% de artefactos del Sprint actualizados y vinculados.

Estas métricas representan criterios de salida; no constituyen evidencia de que el Sprint haya sido ejecutado.

## Riesgos

1. La capacidad baja puede no permitir completar las siete historias; se prioriza seguridad sobre funcionalidad adicional.
2. La aprobación legal de consentimientos puede bloquear WL-SEC-02.
3. Una política RLS incompleta puede exponer datos entre pacientes o profesionales.
4. Roles administrativos no definidos pueden impedir pruebas completas de autorización.
5. La confirmación de correo puede afectar las pruebas de registro y debe contemplarse en QA.

## Registro de decisiones

| Decisión | Estado | Responsable |
|---|---|---|
| Alcance exacto del Sprint 1 | Aprobado | Product Owner |
| Capacidad máxima de 8 puntos | Aprobado | Product Owner + Scrum Master |
| Duración de 2 semanas | Aprobado | Product Owner + Scrum Master |
| Fechas de inicio y fin | `[POR DEFINIR]` | Scrum Master |
| Métricas de salida | Aprobado | Product Owner |
| Matriz final de permisos administrativos | `[POR DEFINIR]` | Arquitectura + Seguridad |
| Aprobación legal de privacidad y consentimiento | `[POR DEFINIR]` | Legal |

## Referencias

- [`PRODUCT_BACKLOG.md`](./PRODUCT_BACKLOG.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`PLAN_PRUEBAS.md`](./PLAN_PRUEBAS.md)
