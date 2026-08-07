# MANUAL_DESARROLLADOR.md — WiseLife

**Propósito:** guía para desarrolladores y procedimientos técnicos.
**Responsable:** Documentador Técnico. **Estado:** Base operativa; requiere validar comandos y accesos actuales.

## Antes de cambiar
1. Leer `PRODUCT_BACKLOG.md`, `ARQUITECTURA.md`, `SEGURIDAD.md` y el documento del dominio.
2. Confirmar rama base y estado del repositorio.
3. No modificar decisiones de otro responsable sin registrarlo y solicitar validación.

## Flujo de trabajo
Crear rama descriptiva desde `main`, implementar sólo el alcance aprobado, mantener commits trazables, actualizar documentación, ejecutar lint/build/tests y abrir PR con riesgos, evidencia y rollback.

## Datos y seguridad
Usar Supabase siguiendo `BASE_DATOS.md`; nunca exponer service role, secretos o PHI; validar ownership y estados en servidor/RLS; no confiar en IDs, roles ni montos enviados por cliente.

## UI y QA
Seguir `UX_GUIDE.md` y `COMPONENTES.md`; cubrir loading/empty/error/success, teclado, responsive y mensajes accesibles. Ejecutar el plan de `PLAN_PRUEBAS.md` y registrar incidencias.

## Despliegue
Seguir `DEVOPS.md`: PR→Preview, merge aprobado→Production; revisar variables por ambiente, logs sin datos sensibles y smoke test post-deploy.

## Documentación obligatoria
Toda funcionalidad debe actualizar backlog/roadmap si aplica, arquitectura, API, datos, seguridad, componentes, QA, manual y changelog según impacto.

## Procedimiento de incidencia
Preservar evidencia sin secretos, identificar commit/deployment, evaluar rollback, corregir mediante PR y registrar causa raíz y acciones preventivas.

## Pendientes `[POR DEFINIR]`
Versión Node, comandos canónicos, estrategia de ramas vigente, proveedores de CI y acceso a staging — **Responsable:** DevOps + Documentador Técnico.

## Referencias
Todos los documentos oficiales de `docs/`.
