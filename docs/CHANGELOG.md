# CHANGELOG.md — WiseLife

**Propósito:** historial de cambios documentales y del proyecto.
**Responsable:** Documentador Técnico. **Estado:** Activo; requiere mantenerlo en cada entrega.

## 2026-10-08 — Módulo de pacientes: Agendar sesión
- Nuevo botón "Agendar sesión" en el menú lateral del paciente, debajo de "Inicio" (`src/components/Sidebar/Sidebar.tsx`) y nueva ruta `/agendar-sesion` en `src/App.tsx`.
- Nueva pantalla `src/pages/AgendarSesion/AgendarSesion.tsx` con tres pasos: (1) elegir especialista con búsqueda por nombre y filtro por especialidad, (2) elegir modalidad, tipo de consulta, día (14 días) y hora, (3) confirmar cita y pagar.
- Los horarios se calculan con `psychologist_availability`, descontando `schedule_blocks`, citas activas (`pendiente_pago`, `confirmada`) y horas ya pasadas del día actual.
- `src/pages/AgendarSesion/BookingModal.tsx` reutiliza el flujo existente: inserta la cita en `appointments` como `pendiente_pago`, maneja el conflicto de horario (`appointments_psychologist_slot_active_uidx`) y registra el pago Nequi dividido 95%/5% con `register_nequi_payment`. No hay cambios de base de datos.
- `src/pages/AgendarSesion/booking.ts` concentra tipos y utilidades (fechas, modalidades, precios por modalidad y tipo de paciente). Los estilos reutilizan clases `sp-*` de `SpecialistProfile.css` y añaden `ag-*` en `AgendarSesion.css`.
- Admite `?especialista=<id>` para abrir el módulo con un especialista preseleccionado.
- Nota técnica: no usar la etiqueta `header` dentro de las pantallas con `DashboardLayout`; una regla global la deja con `position: fixed`.
- Validación: `tsc --noEmit` sin errores y revisión en navegador móvil (389x791) de los pasos 1 y 2. No se probó el pago completo.

## 2026-10-07 — Pago Nequi con comisión del 5% para Vida Sabia
- El paso de pago de `src/pages/SpecialistProfile/SpecialistProfile.tsx` ahora divide el valor de la sesión en dos transferencias Nequi: 95% al número del psicólogo (`psychologists.phone`) y 5% a Vida Sabia (`+57 318 472 6151`). Cada una muestra monto exacto, número y botones "Copiar", y pide su propia referencia de comprobante.
- Se eliminó el uso de `VITE_NEQUI_PHONE` como destino del pago y el deep link `nequi://payments?...`, que no es un esquema público de Nequi y dejaba el pago inoperante. El botón "Abrir Nequi" solo abre la app (o `nequi.com.co` como alternativa).
- Nueva configuración en `src/config/payments.ts` (`PLATFORM_COMMISSION_RATE`, `PLATFORM_NEQUI_PHONE`, `splitPayment`, utilidades de formato).
- Migración `20261007000000_nequi_commission_split`: columnas `platform_fee`, `psychologist_amount`, `platform_phone`, `commission_reference`, `commission_status` en `payment_transactions` y función `register_nequi_payment(p_appointment_id, p_psychologist_reference, p_commission_reference)` (`security definer`, `search_path = ''`, solo `authenticated`). Calcula la comisión en el servidor a partir de `appointments.payment_amount`, valida que la cita sea del paciente y siga en `pendiente_pago`, crea la transacción en estado `processing` y confirma la cita.
- Limitación conocida: la verificación del pago es manual (referencias ingresadas por el paciente); no hay conciliación automática con Nequi. `commission_status` queda en `pending` hasta que Vida Sabia valide la referencia.
- Validación: `tsc --noEmit` sin errores. No se probó el flujo completo en navegador (requiere sesión de paciente y un psicólogo con teléfono configurado).

## 2026-08-08 — Mantenimiento documental
- Se actualizó este historial para registrar la sincronización documental de la rama de trabajo.
- No se modificó código, esquema, infraestructura ni funcionalidad.

## 2026-08-07 — Header: botón "Soy Paciente" reemplaza "Iniciar Sesion"
- Se reemplazó el botón "Iniciar Sesion" (desktop y menú móvil) en `src/components/Header/Header.tsx` por un botón "Soy Paciente", reutilizando el patrón visual del botón "Soy Psicologo" ya existente (variante outline + ícono SVG inline + texto).
- Se añadió un ícono SVG de persona/usuario, distinto al ícono de rayo del botón "Soy Psicologo", para diferenciar ambos botones visualmente.
- La navegación no cambió: el botón sigue apuntando a `/login`.
- Se agregó la variante de color `.btn--outline-cyan` en `src/components/Header/Header.css` (paleta cian/azul `#4dd0e1` / `#42a5f5`, identidad visual de paciente ya usada en el logo y en `.nav-link--active`), análoga a `.btn--outline-accent` (morado, reservada para psicólogo).
- Deuda menor registrada: la clase `.btn--ghost` quedó sin uso en `Header.css` tras este cambio; ver "Migración y deuda conocida" en `COMPONENTES.md`.

## 2026-08-07 — Auditoría y normalización documental
- Se auditó el contenido existente bajo `docs/`, incluidos producto, arquitectura, datos, IA, QA, seguridad, DevOps, SEO, diagramas y documentación oficial previa.
- Se consolidó la información en los 14 documentos oficiales raíz definidos por el proyecto.
- Se registraron pendientes y contradicciones sin inventar decisiones técnicas, de producto o legales.
- No se creó `PROJECT_CONSTITUTION.md` ni `AI_TEAM_CHARTER.md`.
- No se modificó código, esquema, infraestructura ni funcionalidad.

## 2026-08-07 — Documentación oficial inicial
- Se creó la primera estructura documental oficial bajo `docs/oficial/` en el commit `ddcd284`.
- Esta estructura fue absorbida por la normalización actual.

## Política
Cada cambio funcional, técnico, de seguridad, datos, IA, QA o DevOps debe actualizar el documento oficial correspondiente y registrar fecha, responsable, alcance y validaciones.

## Pendientes
Resolver las marcas `[POR DEFINIR]` y mantener este historial alineado con PR, commit y deployment — **Responsable:** Documentador Técnico + responsable del dominio.
