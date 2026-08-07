# Manual para desarrolladores

## Flujo de trabajo

1. Actualizar `main` antes de crear una rama.
2. Crear una rama descriptiva: `feature/*`, `fix/*`, `docs/*` o `chore/*`.
3. Mantener cada PR enfocado y no mezclar negocio con documentación.
4. Ejecutar lint y build antes de solicitar revisión.
5. Abrir PR, revisar preview y responder observaciones.
6. Actualizar documentación, migraciones y notas de cambios cuando aplique.

## Organización

Seguir la estructura existente mientras se migra gradualmente hacia features. Las páginas coordinan; los componentes presentan; los contextos gestionan estado transversal; los adaptadores encapsulan Supabase. No añadir consultas directas duplicadas si existe un contrato reutilizable.

## Supabase seguro

- Usar sesión real y RLS como autorización.
- Validar entrada antes de escribir.
- Evitar confiar en IDs, roles o metadata enviados por el navegador.
- Para tablas hijas, validar también la relación con el recurso padre.
- Añadir políticas `USING` y `WITH CHECK` para escrituras.
- Probar acceso permitido, denegado, usuario anónimo y cambio de propietario.

## Cambios de esquema

Toda modificación debe incluir migración versionada, índices justificados, políticas, impacto de datos, rollback y actualización de `apis.md`/`arquitectura.md`. No ejecutar SQL productivo desde el frontend.

## Calidad

Antes del PR:

- `npm run lint`
- `npm run build`
- Revisar navegación directa y rutas protegidas.
- Verificar estados de carga, vacío y error.
- Comprobar teclado, labels, foco y contraste.
- Confirmar que no hay secretos, PII o datos clínicos en cambios y logs.
- Revisar enlaces de la documentación.

## Checklist documental

- README o índice actualizado.
- Arquitectura afectada documentada.
- API, variables y permisos actualizados.
- Componentes y pantallas listados.
- Diagrama actualizado si cambia un flujo.
- Registro de cambios con commit/PR y pendientes.
- Manual técnico actualizado para instalación o despliegue.

## Revisión

Los cambios de autenticación, datos personales, citas o historia clínica requieren revisión de seguridad. Las decisiones que aún no estén implementadas deben etiquetarse como propuestas o pendientes.
