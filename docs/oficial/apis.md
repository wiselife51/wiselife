# APIs e integraciones

## Alcance

El repositorio actual no expone rutas HTTP propias documentadas. Es una SPA que consume Supabase desde el navegador. Por tanto, este documento inventaría contratos observables sin inventar endpoints.

## Supabase Auth

**Cliente:** `src/lib/supabase.ts`.  
**Consumidor:** `AuthContext` y pantallas de autenticación.  
**Operaciones observables:** registro, inicio/cierre de sesión, escucha de cambios de sesión y callback de autenticación según el flujo implementado.

Requisitos: usar variables `VITE_*` públicas solo para URL y clave pública; nunca exponer claves secretas. La UI debe tratar como estados distintos sesión activa, confirmación de correo, error de credenciales y sesión ausente.

## Supabase Database

El acceso se realiza mediante el cliente Supabase y políticas RLS. Los dominios documentados son perfiles, psicólogos, citas, disponibilidad, encuestas, referencias e historia clínica. La fuente versionada es `supabase/migrations/20260807000100_wiselife_data_architecture.sql`; debe verificarse contra Supabase antes de operar.

Contrato de autorización: cada lectura/escritura debe quedar limitada por `auth.uid()`, rol y relación con el recurso. Los identificadores enviados por el cliente no sustituyen la autorización de RLS.

## Navegación SPA

Las rutas son internas y se resuelven mediante React Router. Vercel reescribe `/(.*)` hacia `/index.html`; no es una API y no debe confundirse con un endpoint de backend.

## Variables

| Variable | Uso | Exposición |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Cliente |
| `VITE_SUPABASE_ANON_KEY` o clave pública equivalente | Cliente Supabase | Cliente |
| Variables secretas de Supabase | Operaciones privilegiadas | Solo servidor/operación |
| `VITE_NEQUI_PHONE` | Configuración pública de pago/contacto existente | Cliente, validar alcance |

Los nombres efectivos deben confirmarse en el archivo de entorno del proyecto y en la integración conectada; nunca documentar valores.

## Errores y límites

- Mapear errores técnicos a mensajes seguros para el usuario.
- No incluir SQL, tokens, PII ni contenido clínico en errores visibles o logs.
- Reintentar solo operaciones idempotentes.
- Las reservas y escrituras clínicas requieren revalidación server-side/RLS.
- No hay endpoints REST propios ni webhooks implementados en esta línea base.

## Pendientes

Definir contratos tipados por dominio, repositorios, límites de paginación, estrategia de cache y pruebas negativas de RLS. Ver también `docs/DATABASE_ARCHITECTURE.md` y `docs/security/PREVENTIVE_SECURITY_AUDIT.md`.
