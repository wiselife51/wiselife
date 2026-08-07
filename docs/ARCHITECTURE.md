# Arquitectura de WiseLife

**Estado:** propuesta basada en el repositorio sincronizado con `main` (`4ddf4e2`).

**Rama documental:** `arq_software`

**Alcance:** frontend, datos, seguridad, despliegue y colaboración. No se modifica código ni esquema.

## 1. Propósito y principios

WiseLife conecta pacientes con profesionales de salud mental, soporta onboarding, encuestas, descubrimiento de especialistas, citas y gestión clínica. La arquitectura debe priorizar privacidad, trazabilidad y evolución incremental.

Principios:

- **Dominios explícitos:** cada capacidad tiene UI, casos de uso y acceso a datos identificables.
- **RLS como frontera:** Supabase autoriza filas; la UI nunca es una frontera de seguridad.
- **Mínimo privilegio:** datos clínicos y credenciales privilegiadas nunca llegan al navegador.
- **Contratos antes que acoplamiento:** componentes consumen hooks/casos de uso, no tablas directamente.
- **Entrega reproducible:** GitHub es fuente de cambios y Vercel automatiza previews y producción.
- **Evolución sin big-bang:** mantener la SPA actual y extraer capas por dominio progresivamente.

## 2. Estado actual

- React 19 + TypeScript + Vite 7.
- `src/App.tsx` concentra rutas; `AuthProvider` envuelve la aplicación.
- `react-router-dom` gestiona navegación e `i18next` internacionalización.
- `src/lib/supabase.ts` expone un cliente singleton de `@supabase/supabase-js`.
- Las páginas y algunos componentes consultan Supabase directamente.
- Dominios visibles: landing, autenticación, onboarding de paciente, encuestas, dashboard de paciente, especialistas, citas, onboarding/dashboard de psicólogos e historia clínica.
- `vercel.json` sirve la SPA mediante rewrite.
- No se encontró workflow de GitHub en el checkout revisado.

La deuda principal es el acoplamiento entre presentación y persistencia: consultas, transformaciones y reglas de negocio están repartidas en páginas de gran tamaño. La primera evolución recomendada es extraer adaptadores y casos de uso sin cambiar el comportamiento visible.

## 3. Módulos de producto

| Módulo | Responsabilidad | Datos sensibles |
|---|---|---|
| Shell y navegación | layout, rutas, i18n, errores | No |
| Identidad y acceso | login, registro, callback, sesión, roles | Sí |
| Perfil y onboarding | datos personales, preferencias, consentimiento | Sí |
| Evaluación y bienestar | encuestas, diario emocional, motivación | Sí |
| Descubrimiento | búsqueda, filtros y perfil de especialistas | Parcial |
| Agenda | disponibilidad, bloqueos, citas, estados | Sí |
| Experiencia clínica | historia, notas, diagnósticos/CIE-10 | Muy alta |
| Psicólogo | onboarding profesional, pacientes y dashboard | Muy alta |
| Plataforma | auditoría, observabilidad, configuración, soporte | Sí |

Cada módulo debe publicar: `components/`, `hooks/`, `domain/`, `repositories/` y `schemas/` únicamente cuando los necesite. La navegación compone módulos; no debe contener lógica de Supabase.

## 4. Patrones de diseño

### Presentación y composición
- **Feature slices:** agrupar por dominio, no por tipo global de archivo.
- **Container/Presentational:** páginas coordinan; componentes visuales reciben props y eventos.
- **Compound components:** usar solo para flujos con estados relacionados, como agenda o historia clínica.
- **Design system:** componentes accesibles y tokens compartidos; evitar estilos duplicados.

### Aplicación y datos
- **Facade de autenticación:** `AuthProvider` expone sesión, usuario y acciones; los módulos no manipulan listeners.
- **Use cases:** `bookAppointment`, `completeOnboarding`, `saveClinicalNote` encapsulan validación y secuencia.
- **Repository/Adapter:** una interfaz de dominio oculta `.from(...)`; el adaptador Supabase traduce filas a modelos.
- **Schema validation:** validar formularios y respuestas externas en los bordes.
- **Query keys/cache:** centralizar claves y estados de carga/error; evitar fetches dispersos en efectos.
- **Result/error mapping:** traducir errores técnicos a estados de UI seguros, sin filtrar detalles de Auth o SQL.

No se recomienda introducir Redux por defecto. El estado remoto debe tener una estrategia de cache; el estado efímero permanece local al flujo.

## 5. Organización de carpetas

### Estructura actual observada

```text
src/
  App.tsx
  main.tsx
  context/AuthContext.tsx
  lib/supabase.ts
  components/<componente>/
  pages/<pantalla>/
public/
database/
vercel.json
```

### Estructura objetivo

```text
src/
  app/                 # bootstrap, router, providers, error boundaries
  components/ui/       # primitives accesibles compartidos
  features/
    auth/{components,domain,hooks,repositories,schemas}
    patient-profile/{components,domain,hooks,repositories,schemas}
    assessments/{components,domain,hooks,repositories,schemas}
    specialists/{components,domain,hooks,repositories,schemas}
    appointments/{components,domain,hooks,repositories,schemas}
    clinical-records/{components,domain,hooks,repositories,schemas}
    psychologist/{components,domain,hooks,repositories,schemas}
  layouts/
  lib/
    supabase/{client,server,types}
    errors/
    validation/
  routes/              # route guards y composición, sin consultas
  types/
  i18n/
```

Migración: extraer primero consultas repetidas de citas e historia clínica; luego onboarding y especialistas; finalmente reducir `App.tsx` a bootstrap y rutas.

## 6. Flujo de datos

### Regla general

`UI -> hook -> caso de uso -> repository -> Supabase -> RLS -> mapper -> estado de UI`.

Las escrituras deben ser idempotentes cuando exista reintento, mostrar estados de carga y no asumir que `signUp` generó sesión si la confirmación de email está activa.

### Autenticación

1. La UI envía credenciales a la fachada de Auth.
2. Supabase Auth crea o valida la sesión.
3. El listener actualiza el contexto y el router aplica guardas.
4. El perfil público se consulta por `auth.uid()`.
5. La autorización se decide con datos confiables de servidor/app metadata y RLS, nunca con `user_metadata` editable.
6. Logout revoca la sesión local y limpia cache sensible.

### Onboarding y evaluaciones

1. Formulario valida esquema localmente.
2. Caso de uso normaliza datos y adjunta el `user_id` de sesión, no uno enviado por el cliente.
3. Repository escribe en la tabla del dominio.
4. RLS valida propietario y relaciones padre-hijo.
5. La UI invalida las consultas del perfil/dashboard.

### Descubrimiento y agenda

La búsqueda lee especialistas publicados. La reserva debe validar disponibilidad, conflictos, estado del especialista y pertenencia del paciente dentro de una operación transaccional o RPC segura. El cliente no calcula ni impone exclusividad por sí solo.

### Historia clínica

El psicólogo autenticado solicita una vista autorizada de paciente; el repository consulta historia, notas y diagnósticos; RLS valida rol, relación profesional-paciente y alcance de la consulta. Las escrituras deben guardar autor, timestamps y, para cambios sensibles, auditoría/versionado. Nunca enviar historia clínica a logs, analytics o errores del navegador.

## 7. Supabase

### Componentes

- **Auth:** email/password por defecto; callback de confirmación y sesión mediante cookies según el entorno.
- **Postgres:** perfiles, profesionales, citas, disponibilidad, bloqueos, diarios, historia clínica, notas y catálogos.
- **RLS:** habilitada en toda tabla expuesta; políticas con `TO authenticated`, `USING` y `WITH CHECK`.
- **Storage:** buckets privados para cualquier documento; políticas por propietario/relación y URLs firmadas de corta duración.
- **Funciones/RPC:** solo para operaciones atómicas o privilegiadas; `SECURITY DEFINER` limitado, `search_path` fijado y función en esquema no expuesto.

### Reglas de seguridad

- Nunca exponer `service_role`/secret key en cliente.
- Cada tabla pública debe tener RLS y grants revisados.
- UPDATE requiere SELECT, `USING` y `WITH CHECK`.
- Las tablas hijas deben validar autorización del padre, no solo `auth.uid()`.
- No usar `user_metadata` para autorización.
- Historia clínica requiere mínimo privilegio, auditoría, retención y exportación controlada.
- Los cambios de esquema deben tener migración versionada, revisión y verificación de advisors.

El archivo `database/sprint1_clinical_history_schema.sql` documenta el dominio clínico inicial y sus políticas. Debe contrastarse con el esquema vivo antes de una migración o implementación.

## 8. Vercel

- **Preview:** cada PR debe producir un preview aislado y verificable.
- **Producción:** solo `main`, tras revisión y checks verdes.
- **Build:** Vite genera la SPA; `vercel.json` mantiene el rewrite para deep links.
- **Variables:** separar Preview/Development/Production; nunca commitear valores. Las claves públicas pueden iniciar con `VITE_`; secretos solo server-side.
- **Observabilidad:** usar logs sin datos clínicos, alertas de errores, métricas de navegación y trazas de operaciones críticas anonimizadas.
- **Seguridad:** headers de seguridad, CSP progresiva, HTTPS y control de origen; validar que Supabase esté incluido en `connect-src` cuando corresponda.

## 9. GitHub y CI/CD

Flujo recomendado:

```text
feature/* -> Pull Request -> checks -> review -> main -> Vercel Production
                         \-> Vercel Preview
```

- `main` es rama protegida y de producción.
- `arq_software` contiene esta entrega documental.
- PR obligatorio, revisión de arquitectura para cambios de esquema/auth y checks automáticos.
- CI mínimo: instalación reproducible, typecheck, lint, tests y build.
- Revisar lockfile y dependencias fijadas; no mezclar cambios de negocio en PRs de documentación.
- Releases y migraciones deben ser trazables a PR, commit y despliegue Vercel.

## 10. Riesgos y controles

| Riesgo | Control |
|---|---|
| IDOR en datos clínicos | RLS por propietario y relación profesional-paciente; pruebas negativas |
| Consultas directas desde páginas | Repositories y casos de uso por feature |
| Datos sensibles en logs | Redacción centralizada y revisión de observabilidad |
| Conflicto de citas | Operación atómica, restricciones y revalidación server-side |
| Drift entre SQL y Supabase | Migraciones versionadas y verificación del esquema vivo |
| Dependencias vulnerables | lockfile, auditoría y actualización controlada |
| Deploy accidental | protección de `main`, PR checks y ambientes separados |

## 11. Roadmap arquitectónico

1. **Fundación:** inventariar tablas/RLS reales, añadir contratos de datos y checks CI sin cambiar comportamiento.
2. **Separación:** extraer repositories y casos de uso para Auth, citas e historia clínica.
3. **Seguridad:** pruebas RLS, auditoría clínica, storage privado y política de retención.
4. **Operación:** observabilidad, errores tipados, feature flags y runbooks de despliegue.
5. **Escala:** cache de lectura, paginación, límites de consulta y particionado solo con evidencia.

## 12. Trazabilidad y pendientes

Inspeccionado: `src/App.tsx`, `src/main.tsx`, `src/context/AuthContext.tsx`, `src/lib/supabase.ts`, páginas y componentes de dominios, `database/sprint1_clinical_history_schema.sql`, `vercel.json`, `package.json`, `blueprint.md` y `README.md`. La rama fue sincronizada con `origin/main` antes de documentar.

Pendientes: confirmar esquema/RLS vivo de Supabase, definir herramienta CI oficial, acordar estrategia de tests de integración y aprobar el modelo de roles profesionales/pacientes. Esta documentación no aplica migraciones, no crea infraestructura y no implementa funcionalidades.
