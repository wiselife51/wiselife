# BASE_DATOS.md — WiseLife

**Propósito:** describir el modelo de datos y diferenciar el esquema vivo del modelo futuro.
**Responsable:** Arquitectura de Base de Datos.
**Estado:** tablas públicas y RLS contrastados con Supabase; columnas, políticas y migraciones completas requieren una auditoría específica.

## Plataforma y tablas verificadas
WiseLife usa PostgreSQL administrado por Supabase. En el esquema `public` se verificaron estas tablas: `appointments`, `cie10_codes`, `clinical_records`, `emotional_diary`, `favorite_specialties`, `payment_transactions`, `profiles`, `psychologist_availability`, `referrals`, `schedule_blocks`, `session_notes` y `psychologists`.

Las tablas públicas consultadas tienen RLS habilitado. La consulta de estado mostró `rls_forced = false`; esto no desactiva RLS, pero significa que no está forzado para roles con privilegios de bypass. La existencia de RLS no sustituye la revisión de cada policy.

## SQL y migraciones
El repositorio contiene `database/sprint1_clinical_history_schema.sql` como SQL versionado. No se identificó una estructura formal `supabase/migrations/` o `supabase/schemas/` en el checkout auditado. Por ello, el SQL local debe tratarse como referencia/versionado parcial y no como prueba de que fue aplicado al proyecto vivo.

Antes de modificar el esquema se debe comparar tablas, columnas, restricciones, índices, policies y migraciones de Supabase. No se ejecutaron cambios durante esta actualización documental.

## Modelo lógico futuro
`app_roles`, `user_roles`, `specialties`, `referral_sources`, relaciones puente, consentimientos, diagnósticos normalizados, auditoría clínica privada, ledger de créditos y entidades de IA son propuestas. No deben considerarse tablas aplicadas hasta verificarlas en Supabase.

## Reglas de seguridad e integridad
- Habilitar RLS en toda tabla expuesta y revisar policies por operación.
- En UPDATE usar `USING` y `WITH CHECK`.
- Derivar ownership de `auth.uid()`.
- Validar la relación con el padre en tablas hijas.
- No usar `user_metadata` para autorización.
- Mantener ledger y auditoría fuera de la escritura directa de usuarios comunes.
- Usar FK e índices coherentes con usuario, profesional, estado y fecha.
- Resolver disponibilidad y movimientos de valor dentro de operaciones atómicas e idempotentes.

## Pendientes
Especificar la estrategia de migración legacy, auditar policies y permisos Data API, definir retención clínica, revisar índices productivos y formalizar políticas de Storage.

**Responsables:** Base de Datos + Seguridad + Legal.

## Referencias
`ARQUITECTURA.md`, `API.md` y `DEVOPS.md`.
