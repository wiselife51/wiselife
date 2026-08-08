-- ============================================================================
-- Cierra la escritura abierta sobre payment_transactions.
--
-- Problema: database/payments_schema.sql:76-85 crea estas dos policies
--
--   create policy "Service role can insert transactions"
--     on payment_transactions for insert with check (true);
--   create policy "Service role can update transactions"
--     on payment_transactions for update using (true);
--
-- El comentario dice "service_role", pero ninguna declara `TO`, asi que
-- aplican a PUBLIC, que en Supabase incluye anon y authenticated. Y el UPDATE
-- no declara `WITH CHECK`, por lo que hereda `USING (true)`: escritura total.
--
-- La anon key viaja en el bundle publico, de modo que cualquiera podia
--   update payment_transactions set status = 'completed'
-- sobre cualquier fila, o insertar transacciones inventadas.
--
-- Solucion: eliminarlas. service_role hace bypass de RLS, asi que las Edge
-- Functions create-nequi-payment y nequi-webhook siguen escribiendo igual;
-- estas policies no le servian a nadie salvo a un atacante.
--
-- Las policies de SELECT (lineas 60-73) SI estan bien acotadas por paciente y
-- por psicologo, y se conservan intactas.
--
-- Idempotente.
-- ============================================================================

drop policy if exists "Service role can insert transactions" on public.payment_transactions;
drop policy if exists "Service role can update transactions" on public.payment_transactions;

-- Se deja constancia de que la tabla no admite escritura desde el cliente.
comment on table public.payment_transactions is
  'Solo escribible por service_role (Edge Functions). El cliente unicamente lee sus propias filas via las policies de SELECT.';

-- Comprobacion: no debe quedar ninguna policy permisiva sobre esta tabla.
do $$
declare
  abiertas int;
begin
  select count(*) into abiertas
    from pg_policies
   where schemaname = 'public'
     and tablename = 'payment_transactions'
     and (qual = 'true' or with_check = 'true');

  if abiertas > 0 then
    raise exception 'Siguen existiendo % policies permisivas en payment_transactions', abiertas;
  end if;
end $$;

-- ============================================================================
-- PENDIENTE, fuera del alcance de esta migracion (requiere cambios de codigo):
--
--   * supabase/functions/nequi-webhook: no verifica firma HMAC ni el monto.
--     Cualquier POST con un transactionId valido confirma la cita.
--   * supabase/functions/create-nequi-payment: acepta `amount` y
--     `psychologistPhone` del body sin validar el JWT del llamador.
--   * SpecialistProfile.handleConfirmPayment: el paciente escribe a mano
--     `status: 'confirmada'` desde el navegador.
--
-- Esta migracion cierra la escritura directa a la tabla, pero el estado de
-- pago lo sigue decidiendo el cliente por esas tres vias.
-- ============================================================================
