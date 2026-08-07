# Checklist de seguridad WiseLife

## Supabase y secretos

- [ ] Solo publishable/anon key en cliente; nunca service-role o secret key.
- [ ] Variables de producción provienen del entorno; eliminar fallbacks hardcodeados.
- [ ] RLS habilitado en toda tabla expuesta del esquema `public`.
- [ ] Políticas combinan rol objetivo (`authenticated`) con ownership/autorización.
- [ ] UPDATE tiene `USING` y `WITH CHECK`.
- [ ] No se usa `user_metadata` editable para decisiones de autorización; usar app metadata o tabla de roles protegida.
- [ ] Views sensibles usan `security_invoker` o esquema no expuesto.
- [ ] Funciones privilegiadas son mínimas, con `search_path` fijado y grants restringidos.

## Auth y sesión

- [ ] Login/registro no permiten enumeración de cuentas.
- [ ] Callback valida `code`, origen y error; no acepta open redirects.
- [ ] Logout revoca/limpia sesión y rutas protegidas redirigen.
- [ ] Expiración y refresh probados en pestaña nueva y tras revocación.
- [ ] Rate limit aplicado a login, registro, recuperación y operaciones sensibles.
- [ ] Cookies seguras en producción y CSP aplicada, no solo report-only.

## Autorización y datos clínicos

- [ ] Paciente solo ve sus citas, perfil e historia.
- [ ] Psicólogo solo ve pacientes/citas asignados según regla de negocio.
- [ ] IDs manipulados en URL/body producen 403/404 sin filtrar existencia.
- [ ] Notas clínicas y diagnósticos no aparecen en logs, analytics ni errores de UI.
- [ ] Exportación/impresión clínica requiere autorización explícita.
- [ ] Eliminación y retención cumplen política definida.

## Inputs y frontend

- [ ] Texto de perfiles, notas y encuestas se escapa/sanitiza contra XSS.
- [ ] UUID, fechas, horas, montos y teléfonos se validan en servidor.
- [ ] Montos de reserva se recalculan server-side; no confiar en precio cliente.
- [ ] Doble submit y replay de pago/reserva son idempotentes.
- [ ] Enlaces externos usan destinos permitidos y `noopener` cuando aplica.
- [ ] Errores muestran información accionable sin stack traces ni secretos.

## Pruebas negativas requeridas

1. Dos usuarios intentan leer/editar la misma cita.
2. Paciente intenta consultar historia clínica ajena.
3. Psicólogo intenta acceder a paciente no asignado.
4. Request anónimo intenta insertar/actualizar tablas protegidas.
5. Se cambia precio, `user_id`, `psychologist_id` o estado en el payload.
6. Se envían HTML/script en nombre, notas y respuestas.
7. Se repite la misma reserva/pago con la misma clave de idempotencia.
8. Se usa token expirado, revocado o de otra sesión.

Registrar solo datos sintéticos y hashes/IDs anonimizados en la evidencia.
