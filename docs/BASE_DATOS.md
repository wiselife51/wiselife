# BASE_DATOS.md — WiseLife

**Propósito:** modelo de datos, tablas, relaciones, índices y políticas.
**Responsable:** Arquitecto de Base de Datos. **Estado:** Requiere validación contra Supabase vivo.

## Plataforma
PostgreSQL administrado por Supabase. El esquema base documentado incluye `profiles`, `emotional_diary`, `referrals`, `favorite_specialties`, `psychologists`, `psychologist_availability`, `schedule_blocks`, `appointments`, `clinical_records`, `session_notes`, `cie10_codes` y `payment_transactions`.

## Modelo lógico propuesto
Roles (`app_roles`, `user_roles`), catálogos (`specialties`, `referral_sources`), relaciones puente, consentimientos, diagnósticos normalizados, auditoría clínica privada y ledger de créditos. Las entidades IA son candidatas, no migraciones aplicadas.

## Reglas
RLS en tablas expuestas; `USING` y `WITH CHECK`; propietarios derivados de `auth.uid()`; hijos validan relación padre; catálogo legible autenticado; ledger y auditoría no mutables por usuarios comunes. No usar `user_metadata` para autorización.

## Integridad y rendimiento
FK restrictivas para evidencia clínica, cascada sólo en datos derivados, índices por usuario/profesional/estado/fecha, idempotency keys para movimientos de saldo y operación atómica para disponibilidad.

## Migraciones
`database/sprint1_clinical_history_schema.sql` y migraciones Supabase son referencias versionadas. No asumir que fueron ejecutadas: comparar tablas, columnas, restricciones, índices y políticas antes de aplicar.

## Pendientes `[POR DEFINIR]`
Esquema/RLS vivo, estrategia de migración legacy, retención clínica, índices productivos y políticas de Storage — **Responsable:** Arquitecto de Base de Datos + Seguridad + Legal.

## Referencias
`ARQUITECTURA.md`, `API.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`.
