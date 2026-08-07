# Auditoría preventiva de seguridad — WiseLife

**Fecha:** 2026-08-07  
**Rama:** `arq_security`  
**Referencia revisada:** `main` sincronizada con `origin/main` antes de la auditoría  
**Alcance:** frontend React/Vite, autenticación Supabase, acceso a datos clínicos, migraciones SQL, configuración de despliegue y dependencias visibles en el repositorio.

## 1. Dictamen ejecutivo

WiseLife procesa información clínica y datos personales de alta sensibilidad. El proyecto contiene medidas positivas, entre ellas uso de Supabase Auth, consultas condicionadas por identificadores en varias pantallas y una migración que propone roles separados, RLS, historial de consentimientos, bitácora clínica privada y un ledger inmutable.

**Estado preventivo:** no aprobar el inicio de desarrollo de nuevas funcionalidades clínicas ni un despliegue productivo hasta cerrar los riesgos críticos y altos de esta auditoría. El mayor riesgo no es una vulnerabilidad de una pantalla aislada, sino la combinación de acceso directo desde el navegador, autorización distribuida en componentes React y la necesidad de demostrar RLS efectivo sobre todas las tablas existentes.

Esta auditoría es documental y estática. No sustituye una prueba autorizada de penetración, una revisión de la configuración del proyecto Supabase, una validación de backups/restauración ni un análisis de secretos en todo el historial Git.

## 2. Hallazgos priorizados

| ID | Riesgo | OWASP / categoría | Severidad | Evidencia o condición | Control requerido |
|---|---|---|---|---|---|
| SEC-001 | BOLA/IDOR sobre datos clínicos si alguna tabla o política permite consultar por un ID ajeno | A01 Broken Access Control | **Crítica** | Existen múltiples consultas frontend a `clinical_records`, `session_notes`, `appointments` y perfiles. El frontend no es una frontera de autorización confiable. | Matriz de acceso por rol y relación paciente/psicólogo/admin; RLS explícito para `SELECT`, `INSERT`, `UPDATE`, `DELETE`; pruebas negativas con dos usuarios. |
| SEC-002 | Dependencia de autorización del cliente | A01 | **Alta** | La aplicación es una SPA y `AuthContext` mantiene el estado de sesión en React; cualquier guard visual puede ser omitido por un atacante. | Autorizar cada operación en RLS o en un backend/server action; no confiar en rutas, estados, `user_metadata` ni botones ocultos. |
| SEC-003 | Cobertura RLS incompleta o no demostrada en tablas de producción | A01 | **Crítica** | La migración habilita RLS en tablas nuevas, pero declara que no se ejecuta automáticamente y no prueba las tablas existentes. | Inventario de todas las tablas expuestas, `ENABLE/FORCE ROW LEVEL SECURITY` cuando corresponda, políticas por operación y revisión de grants; ejecutar advisors de Supabase. |
| SEC-004 | Escalamiento de privilegios mediante metadatos editables | A01 | **Alta** | El modelo requiere roles (`admin`, `psychologist`, `patient`); Supabase advierte que `raw_user_meta_data` es editable por el usuario. | Usar `user_roles`/`app_metadata` administrado; prohibir decisiones de autorización basadas en `user_metadata`; auditar cambios de roles. |
| SEC-005 | Redirección manipulable en callback OAuth | A01 | **Alta** | `AuthCallback` acepta `next` y decide el flujo con `startsWith('/psicologo')`. | Implementar allowlist exacta de rutas internas, rechazar URLs absolutas/protocol-relative y no convertir parámetros del callback en autoridad de rol. |
| SEC-006 | Enumeración de cuentas y filtración de errores de Auth | A07 Identification and Authentication Failures | **Alta** | `AuthContext` retorna `error.message` de Supabase directamente al consumidor y la UI puede mostrarlo. | Mensajes genéricos para credenciales; conservar únicamente mensajes accionables (confirmación, rate limit); registrar detalles sólo en servidor protegido. |
| SEC-007 | Sesiones y tokens expuestos a XSS | A07 / A03 | **Alta** | Supabase Auth opera en cliente; la sesión está disponible al runtime del navegador. No se observan headers de seguridad en `vercel.json`. | Escapar todo output, eliminar sinks peligrosos, CSP primero report-only y luego enforcing, `connect-src` limitado al proyecto Supabase, cookies Secure en producción y expiración adecuada. |
| SEC-008 | Falta de headers de defensa en profundidad | A05 Security Misconfiguration | **Media-Alta** | `vercel.json` sólo contiene un rewrite hacia `index.html`. | Añadir headers en configuración de despliegue: `X-Content-Type-Options`, `Referrer-Policy`, HSTS en HTTPS, `Permissions-Policy`, CSP y `X-Frame-Options` si no se requiere embedding. |
| SEC-009 | Privacidad y exposición accidental de historia clínica | A01 / A04 | **Crítica** | Componentes como `ClinicalHistoryView`, `SessionNoteModal` y `ClinicalRecordModal` manejan notas, diagnósticos y consentimientos en el navegador. | Minimización de campos, acceso por necesidad de saber, no incluir PHI en logs/URLs/analytics, bloqueo de exportaciones no autorizadas, auditoría de lectura y borrado controlado. |
| SEC-010 | Integridad de consentimientos y trazabilidad | A08 Software and Data Integrity Failures | **Alta** | La migración propone `consent_events`, pero también mantiene columnas booleanas legacy. | Definir fuente de verdad, versionar el texto legal, guardar actor/fecha/origen, impedir mutación directa y reconciliar legacy antes de usarlo en decisiones. |
| SEC-011 | Ledger de créditos y lógica de valor manipulable | A04 / A06 | **Alta** | La migración crea un ledger, pero el frontend contiene flujos de referrals/créditos. | Mutaciones atómicas server-side/RPC segura, idempotencia, límites de velocidad, no aceptar saldo ni `delta` desde cliente, conciliación y alertas de fraude. |
| SEC-012 | Funciones `SECURITY DEFINER` de alto impacto | A01 / A05 | **Alta** | `private.has_app_role` usa `SECURITY DEFINER`; el patrón requiere especial cuidado de `search_path`, grants y pruebas. | Mantener schema no expuesto, `set search_path = ''`, nombres plenamente calificados, revocar `PUBLIC`, conceder sólo a `authenticated`, probar bypass de RLS. |
| SEC-013 | Manipulación de pagos o identificadores externos | A04 / A06 | **Alta** | Hay referencias a transacciones Nequi y variables relacionadas en el proyecto. | Validar estado y monto server-side, verificar callbacks/webhooks con autenticidad e idempotencia; nunca confiar en teléfono, monto o estado enviados por el navegador. |
| SEC-014 | Dependencias desactualizadas o vulnerables | A06 Vulnerable Components | **Media** | `package.json` usa rangos `^`, incluyendo `@supabase/supabase-js`; no hay evidencia en este informe de un lockfile validado. | Cometer lockfile, ejecutar `npm audit --omit=dev`, revisar advisories, fijar versiones aprobadas y actualizar con revisión de cambios. |
| SEC-015 | Ausencia de controles automatizados de seguridad en CI/CD | A05 / A06 | **Media-Alta** | No se identificó en el alcance revisado una política documentada de lint, typecheck, secret scanning, dependency review y pruebas RLS. | Pipeline obligatorio con build, lint, typecheck, audit, secret scan, SQL lint/advisors y pruebas de autorización antes de merge/deploy. |
| SEC-016 | Falta de detección y respuesta específica para PHI | A09 Security Logging and Monitoring Failures | **Alta** | La migración propone bitácora, pero no se verificó su escritura automática para lecturas, cambios y exportaciones. | `request_id`, actor, recurso, acción, resultado y timestamp; retención y acceso restringidos; alertas por exportaciones masivas, fallos repetidos y cambios de privilegios. |
| SEC-017 | Borrado/ciclo de vida y backups no definidos | A02 / privacidad | **Alta** | Las tablas clínicas contienen relaciones y `on delete` que pueden preservar o eliminar datos según el caso; no se documenta retención operativa. | Política de retención, legal hold, anonimización, restauración probada, cifrado y control de acceso a backups; no borrar evidencia clínica/audit trail accidentalmente. |
| SEC-018 | Riesgo de CSRF y operaciones de cambio sin modelo uniforme | A01 / A05 | **Media** | El cliente realiza directamente mutaciones Supabase desde varias páginas. | Establecer patrón único de mutaciones, validación de intención, RLS, reautenticación para acciones sensibles y pruebas desde origen cruzado. |

## 3. Controles obligatorios antes del desarrollo

### 3.1 Identidad y autorización

- Definir una matriz formal: paciente, psicólogo, administrador, soporte y tareas permitidas.
- Separar autenticación de autorización; las rutas protegidas son sólo UX.
- Centralizar la resolución del rol y almacenar roles en una fuente no editable por el usuario.
- Revisar Google/Facebook, redirect URIs permitidas, expiración/revocación de sesiones y confirmación de correo.
- Implementar allowlist de callback y mensajes de autenticación que no permitan enumeración.

### 3.2 Supabase y base de datos

- Inventariar todas las tablas, vistas, funciones, buckets, grants y schemas expuestos.
- Para cada tabla, documentar propietario, relaciones, operaciones y política RLS positiva/negativa.
- Confirmar que cada `UPDATE` tenga `USING` y `WITH CHECK`, y que cada `INSERT` valide también la relación con el padre.
- No usar `SECURITY DEFINER` como solución genérica a permisos; restringirlo y probarlo.
- Evitar vistas que evadan RLS; usar `security_invoker` cuando aplique.
- Añadir tests automatizados para lectura cruzada, mutación cruzada, escalamiento de rol, exportación y registros huérfanos.

### 3.3 Datos clínicos y privacidad

- Clasificar PHI/PII, definir minimización y necesidad de saber.
- Prohibir datos clínicos en `console.log`, errores de frontend, query strings, nombres de archivos y herramientas de analítica.
- Versionar consentimientos y registrar aceptación/rechazo de forma append-only.
- Definir retención, rectificación, exportación, eliminación, legal hold y respuesta a incidentes.
- Aplicar cifrado en tránsito y reposo con gestión de claves y acceso mínimo; documentar jurisdicción y obligaciones aplicables.

### 3.4 Aplicación y despliegue

- Añadir headers de seguridad y una CSP compatible con el origen Supabase.
- Implementar rate limiting para login, signup, reset, callbacks, exportaciones y operaciones de alto valor.
- Validar tipos, tamaños, fechas, estados, IDs y archivos en el servidor/base de datos.
- Proteger webhooks y pagos con firma, timestamp, replay protection e idempotency keys.
- Activar secret scanning, dependency review, lockfile obligatorio y revisión de permisos del repositorio.

## 4. Evidencia mínima de aceptación

Antes de iniciar nuevas funcionalidades se debe adjuntar al PR:

1. Matriz de autorización aprobada por producto, clínica y seguridad.
2. Inventario RLS/grants con consultas de verificación y resultado de advisors.
3. Pruebas de dos usuarios: ningún paciente lee/modifica otro paciente; ningún psicólogo accede a pacientes fuera de su relación; sólo admin gestiona roles.
4. Pruebas de callback contra `next` malicioso y rutas no permitidas.
5. Reporte `npm audit`, lockfile y revisión de dependencias.
6. Captura o reporte de headers/CSP en preview y producción.
7. Evidencia de logs de acceso clínico y alerta de exportación anómala.
8. Procedimiento probado de backup, restore y respuesta a incidente.

## 5. Orden recomendado de remediación

**Bloqueante:** SEC-001, SEC-003, SEC-004, SEC-005, SEC-009.  
**Antes de producción:** SEC-006, SEC-007, SEC-010, SEC-011, SEC-012, SEC-013, SEC-016, SEC-017.  
**Antes de cada entrega:** SEC-014, SEC-015, SEC-018 y regresión de controles críticos.

## 6. Verificaciones ejecutadas

- `git fetch origin main`, `git checkout main`, `git pull --ff-only origin main`: correcto; `main` estaba actualizado al iniciar la auditoría.
- `git diff --check`: correcto.
- `npm run lint`: no conforme por errores preexistentes en componentes clínicos, tipado `any`, hooks condicionales y otras reglas ESLint; no se modificaron porque esta entrega es documental.
- `npm run build`: pendiente de ejecución independiente después del fallo de lint; registrar el resultado en el PR antes de aprobar.
- `npm audit --omit=dev --audit-level=moderate`: no conforme; reportó 5 vulnerabilidades (1 moderada, 3 altas y 1 crítica) en `i18next-http-backend`, `react-router`/`react-router-dom`, `swiper` y `ws`. No se ejecutó `npm audit fix` para evitar cambios de dependencias fuera del alcance de esta auditoría.

## 7. Limitaciones y supuestos

- La revisión se realizó sobre el contenido disponible en el repositorio en `main` al iniciar la auditoría y sobre la rama de trabajo `arq_security`.
- No se aplicaron cambios de esquema ni se modificaron funcionalidades de negocio.
- No se asume que una migración SQL propuesta esté aplicada en el proyecto Supabase; debe verificarse por el flujo autorizado de migraciones.
- La ausencia de evidencia en el repositorio se registra como riesgo de control, no como prueba concluyente de que el control no exista en la infraestructura.

## 8. Resultado de aprobación

**Recomendación:** aprobación de arquitectura de seguridad condicionada. WiseLife puede continuar con diseño técnico y remediación de controles, pero el desarrollo de nuevas funcionalidades que procesen información clínica debe quedar bloqueado hasta demostrar los controles obligatorios y la evidencia de aceptación descrita arriba.
