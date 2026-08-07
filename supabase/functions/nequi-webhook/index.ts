// ============================================
// SUPABASE EDGE FUNCTION: NEQUI WEBHOOK
// Recibe notificaciones de confirmación de pago de Nequi
// y envía emails de confirmación
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  transactionId: string;
  status: string;
  amount?: number;
  phoneNumber?: string;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    console.log('Received webhook:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find transaction by Nequi transaction ID
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*, appointments(appointment_date, start_time)')
      .eq('nequi_transaction_id', payload.transactionId)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', payload.transactionId);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map Nequi status to our status
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'completed',
      'SUCCESS': 'completed',
      'COMPLETED': 'completed',
      'FAILED': 'failed',
      'REJECTED': 'failed',
      'CANCELLED': 'cancelled',
      'PENDING': 'processing',
    };

    const newStatus = statusMap[payload.status.toUpperCase()] || 'processing';

    // Update transaction status
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        webhook_data: payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    // If payment completed, update appointment and send emails
    if (newStatus === 'completed') {
      console.log('Payment completed, updating appointment and sending emails...');

      // Update appointment status
      await supabase
        .from('appointments')
        .update({
          status: 'confirmada',
          payment_status: 'pagado',
          payment_method: 'nequi',
          payment_reference: payload.transactionId,
          payment_amount: transaction.amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.appointment_id);

      // Get patient and psychologist emails
      const { data: patient } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', transaction.patient_id)
        .single();

      const { data: psychologist } = await supabase
        .from('psychologists')
        .select('email, full_name, phone')
        .eq('id', transaction.psychologist_id)
        .single();

      // Send emails
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey && patient && psychologist) {
        // Email to patient
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Vida Sabia <noreply@vidasabia.com>',
              to: patient.email,
              subject: '✅ Pago confirmado - Vida Sabia',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #7e57c2;">✅ Tu pago ha sido confirmado</h2>

                  <p>Hola <strong>${patient.full_name}</strong>,</p>

                  <p>Tu pago de <strong>$${transaction.amount.toLocaleString()} COP</strong> ha sido procesado exitosamente a través de Nequi.</p>

                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalles del pago</h3>
                    <p><strong>Monto:</strong> $${transaction.amount.toLocaleString()} COP</p>
                    <p><strong>Método:</strong> Nequi</p>
                    <p><strong>ID de transacción:</strong> ${payload.transactionId}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
                    <p><strong>Psicólogo/a:</strong> ${psychologist.full_name}</p>
                  </div>

                  <p>Tu cita está confirmada. Te esperamos!</p>

                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Este es un correo automático, por favor no respondas a este mensaje.
                  </p>
                </div>
              `,
            }),
          });

          await supabase
            .from('payment_transactions')
            .update({ patient_email_sent: true })
            .eq('id', transaction.id);

          console.log('Email sent to patient');
        } catch (emailError) {
          console.error('Error sending email to patient:', emailError);
        }

        // Email to psychologist
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Vida Sabia <noreply@vidasabia.com>',
              to: psychologist.email,
              subject: '💰 Has recibido un pago - Vida Sabia',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #7e57c2;">💰 Has recibido un pago</h2>

                  <p>Hola <strong>${psychologist.full_name}</strong>,</p>

                  <p>Has recibido un pago de <strong>$${transaction.amount.toLocaleString()} COP</strong> en tu número Nequi terminado en <strong>${transaction.nequi_phone_number.slice(-4)}</strong>.</p>

                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detalles del pago</h3>
                    <p><strong>Monto recibido:</strong> $${transaction.amount.toLocaleString()} COP</p>
                    <p><strong>Paciente:</strong> ${patient.full_name}</p>
                    <p><strong>Método:</strong> Nequi</p>
                    <p><strong>ID de transacción:</strong> ${payload.transactionId}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
                  </div>

                  <p>La cita ha sido confirmada automáticamente.</p>

                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Este es un correo automático, por favor no respondas a este mensaje.
                  </p>
                </div>
              `,
            }),
          });

          await supabase
            .from('payment_transactions')
            .update({ psychologist_email_sent: true })
            .eq('id', transaction.id);

          console.log('Email sent to psychologist');
        } catch (emailError) {
          console.error('Error sending email to psychologist:', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nequi-webhook:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
