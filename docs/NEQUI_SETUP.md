# 💳 Configuración de Pagos con Nequi

Este documento explica cómo configurar la integración completa con Nequi para pagos push en Vida Sabia.

## 📋 Requisitos Previos

1. **Cuenta de comercio en Nequi**
   - Necesitas una cuenta de negocio en Nequi
   - Contactar a Nequi para obtener acceso a la API: https://conecta.nequi.com.co

2. **Credenciales de API**
   - Client ID
   - Client Secret
   - API Key
   - Número de teléfono Nequi del negocio

3. **Cuenta en Resend** (para emails)
   - Crear cuenta en https://resend.com
   - Obtener API Key

---

## 🔧 Paso 1: Ejecutar el Schema de Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: database/payments_schema.sql
```

Este script crea:
- Tabla `payment_transactions` para registrar pagos
- Índices para búsquedas rápidas
- Políticas RLS para seguridad
- Triggers automáticos

---

## 🚀 Paso 2: Desplegar Edge Functions en Supabase

### 2.1 Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Iniciar sesión

```bash
supabase login
```

### 2.3 Link al proyecto

```bash
supabase link --project-ref TU_PROJECT_REF
```

### 2.4 Desplegar las funciones

```bash
# Función para crear pago
supabase functions deploy create-nequi-payment

# Función webhook
supabase functions deploy nequi-webhook
```

---

## 🔐 Paso 3: Configurar Variables de Entorno

Ve a tu proyecto en Supabase Dashboard → Edge Functions → Settings

### Variables requeridas:

```bash
# Credenciales de Nequi
NEQUI_CLIENT_ID=tu_client_id_aqui
NEQUI_CLIENT_SECRET=tu_client_secret_aqui
NEQUI_API_KEY=tu_api_key_aqui
NEQUI_BASE_URL=https://api.nequi.com.co  # Producción
# NEQUI_BASE_URL=https://sandbox.nequi.com.co  # Para pruebas

# API de Resend para emails
RESEND_API_KEY=re_tu_api_key_aqui
```

**Comandos para configurar:**

```bash
supabase secrets set NEQUI_CLIENT_ID="tu_client_id"
supabase secrets set NEQUI_CLIENT_SECRET="tu_client_secret"
supabase secrets set NEQUI_API_KEY="tu_api_key"
supabase secrets set NEQUI_BASE_URL="https://api.nequi.com.co"
supabase secrets set RESEND_API_KEY="re_tu_api_key"
```

---

## 🔗 Paso 4: Configurar Webhook en Nequi

1. **Ir al portal de Nequi**: https://conecta.nequi.com.co
2. **Configurar webhook URL**:
   ```
   https://TU_PROJECT_REF.supabase.co/functions/v1/nequi-webhook
   ```
3. **Eventos a suscribir**:
   - `payment.approved`
   - `payment.rejected`
   - `payment.failed`

---

## 📧 Paso 5: Configurar Resend para Emails

### 5.1 Crear cuenta en Resend

1. Ir a https://resend.com
2. Crear cuenta gratuita (100 emails/día)
3. Verificar dominio (opcional pero recomendado)

### 5.2 Obtener API Key

1. Dashboard → API Keys → Create API Key
2. Copiar la key (empieza con `re_`)
3. Configurar en Supabase (ya hecho en Paso 3)

### 5.3 Configurar dominio verificado (opcional)

Si quieres usar tu propio dominio:

1. Resend → Domains → Add Domain
2. Agregar `vidasabia.com` (o tu dominio)
3. Configurar registros DNS:
   - SPF
   - DKIM
   - DMARC
4. Verificar

**Nota:** Si no verificas dominio, los emails se enviarán desde `onboarding@resend.dev`

---

## 🧪 Paso 6: Probar la Integración

### Modo Sandbox (Pruebas)

Usar `NEQUI_BASE_URL=https://sandbox.nequi.com.co` para pruebas.

### Flujo de prueba:

1. **Paciente crea una cita** en la app
2. **Click en "Pagar con Nequi"**
3. **Sistema llama a Edge Function** `create-nequi-payment`
4. **Nequi envía push** al celular del psicólogo
5. **Psicólogo autoriza** el pago en su app Nequi
6. **Nequi llama al webhook** `nequi-webhook`
7. **Sistema actualiza** la cita y envía emails

### Verificar en logs:

```bash
# Ver logs de las funciones
supabase functions logs create-nequi-payment
supabase functions logs nequi-webhook
```

---

## 📊 Paso 7: Monitoreo

### Ver transacciones en Supabase

```sql
-- Todas las transacciones
SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- Transacciones pendientes
SELECT * FROM payment_transactions WHERE status = 'processing';

-- Transacciones completadas hoy
SELECT * FROM payment_transactions
WHERE status = 'completed'
AND DATE(completed_at) = CURRENT_DATE;
```

### Dashboard de métricas

Puedes crear un dashboard en Supabase Dashboard → Database → Tables → payment_transactions

---

## ❗ Troubleshooting

### Error: "Nequi credentials not configured"

**Solución:** Verificar que las variables de entorno estén configuradas:

```bash
supabase secrets list
```

### Error: "Transaction not found" en webhook

**Solución:** Verificar que el `transactionId` de Nequi coincida con el guardado en la BD.

### Emails no se envían

**Solución:**
1. Verificar que `RESEND_API_KEY` esté configurada
2. Verificar límites de cuenta Resend (100/día en plan free)
3. Ver logs: `supabase functions logs nequi-webhook`

### Push no llega al celular

**Solución:**
1. Verificar que el número de teléfono esté correcto (sin espacios ni guiones)
2. Verificar que sea un número Nequi válido
3. Verificar en logs de Nequi si hubo error

---

## 🔒 Seguridad

### Buenas prácticas:

1. ✅ **Nunca** exponer credenciales en el código
2. ✅ **Usar** variables de entorno (secrets)
3. ✅ **Habilitar** RLS en todas las tablas
4. ✅ **Validar** webhooks (verificar firma si Nequi la proporciona)
5. ✅ **Logs** de todas las transacciones
6. ✅ **Monitorear** transacciones sospechosas

### Webhook seguro:

Si Nequi proporciona firma de webhook, agregar validación en `nequi-webhook/index.ts`:

```typescript
const signature = req.headers.get('x-nequi-signature');
const isValid = verifySignature(payload, signature, NEQUI_WEBHOOK_SECRET);
if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

---

## 💰 Costos

### Nequi:
- **Tarifas**: Consultar con Nequi (depende del volumen)
- **Típicamente**: 1-3% por transacción

### Resend:
- **Plan Free**: 100 emails/día, 3,000/mes
- **Plan Pro**: $20/mes, 50,000 emails/mes

### Supabase:
- **Edge Functions**: Incluidas en plan Free (500,000 invocaciones/mes)
- **Plan Pro**: $25/mes para mayor límite

---

## 📞 Soporte

### Nequi:
- Portal: https://conecta.nequi.com.co
- Docs: https://docs.nequi.com.co
- Soporte: soporte@nequi.com.co

### Resend:
- Docs: https://resend.com/docs
- Discord: https://resend.com/discord

### Supabase:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `payments_schema.sql` en Supabase
- [ ] Obtener credenciales de Nequi (Client ID, Secret, API Key)
- [ ] Crear cuenta en Resend y obtener API Key
- [ ] Instalar Supabase CLI
- [ ] Desplegar Edge Functions
- [ ] Configurar variables de entorno (secrets)
- [ ] Configurar webhook en portal de Nequi
- [ ] Probar flujo completo en sandbox
- [ ] Verificar que lleguen los emails
- [ ] Pasar a producción
- [ ] Monitorear transacciones

---

## 📝 Notas Adicionales

- **Tiempo de implementación**: 2-3 horas
- **Dificultad**: Media
- **Requisitos técnicos**: Familiaridad con APIs REST, webhooks
- **Soporte necesario**: Nequi debe aprobar tu cuenta de comercio

**¿Necesitas ayuda?** Contacta al equipo de desarrollo de Vida Sabia.
