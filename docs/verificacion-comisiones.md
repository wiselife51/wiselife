# Verificación de comisiones de la plataforma

## Flujo

1. Cuando un pago de paciente se confirma, el trigger `appointments_commission_guard` calcula la comisión (5 %) y deja `commission_status = 'pendiente'`.
2. El psicólogo transfiere la comisión, adjunta la foto del comprobante (JPG, PNG o WebP, máx. 5 MB) y pulsa "Enviar a verificación". La foto se guarda en el bucket privado `commission-proofs` bajo la carpeta `{auth.uid()}/` y la cita pasa a `reportada` (mostrada como "En verificación").
3. El administrador abre `/admin` > pestaña "Comisiones", consulta el comprobante mediante una URL firmada y elige:
   - Verificar: `commission_status = 'verificada'`.
   - Rechazar (motivo obligatorio): vuelve a `pendiente`, se borra el comprobante anterior y el psicólogo ve el motivo.

## Base de datos

| Elemento | Detalle |
| --- | --- |
| `appointments.commission_proof_path` | Ruta de la foto en `commission-proofs` |
| `appointments.commission_review_note` | Motivo del rechazo |
| `commission_status` | `no_aplica`, `pendiente`, `reportada`, `verificada` |
| `admin_list_commission_reviews()` | RPC solo admin: lista comisiones `reportada` y `verificada` |
| `admin_review_commission(id, approve, note)` | RPC solo admin: verifica o rechaza |

Seguridad: el trigger impide que el psicólogo pase a `reportada` sin comprobante, que el paciente cambie campos de comisión y que alguien distinto al admin marque `verificada`. Las políticas de storage permiten subir solo a la carpeta propia y leer al dueño o al admin.

## Frontend

- `src/pages/PsychologistDashboard/PsychologistDashboard.tsx`: carga de la foto, sección "En verificación" y visor del comprobante del paciente renderizado con `createPortal` en `document.body` (corrige el visor que se veía en otra pantalla en responsive).
- `src/pages/Admin/CommissionReviews.tsx`: revisión de comisiones.
- Migración: `supabase/migrations/20261011000100_commission_proof_admin_verification.sql`.
