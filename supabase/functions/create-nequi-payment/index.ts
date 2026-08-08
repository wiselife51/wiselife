// ============================================
// SUPABASE EDGE FUNCTION: CREATE NEQUI PAYMENT
// Crea un push payment en Nequi
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  appointmentId: string;
  amount: number;
  psychologistPhone: string;
  patientName: string;
  patientEmail: string;
}

interface NequiAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface NequiPaymentResponse {
  transactionId: string;
  pushToken: string;
  status: string;
  deepLink?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const { appointmentId, amount, psychologistPhone, patientName, patientEmail }: PaymentRequest = await req.json();

    // Validations
    if (!appointmentId || !amount || !psychologistPhone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Nequi credentials from environment
    const nequiClientId = Deno.env.get('NEQUI_CLIENT_ID');
    const nequiClientSecret = Deno.env.get('NEQUI_CLIENT_SECRET');
    const nequiApiKey = Deno.env.get('NEQUI_API_KEY');
    const nequiBaseUrl = Deno.env.get('NEQUI_BASE_URL') || 'https://api.nequi.com.co';

    if (!nequiClientId || !nequiClientSecret || !nequiApiKey) {
      throw new Error('Nequi credentials not configured');
    }

    // Step 1: Authenticate with Nequi OAuth
    console.log('Authenticating with Nequi...');
    const authResponse = await fetch(`${nequiBaseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: nequiClientId,
        client_secret: nequiClientSecret,
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Nequi auth error:', errorText);
      throw new Error(`Nequi authentication failed: ${authResponse.status}`);
    }

    const authData: NequiAuthResponse = await authResponse.json();
    console.log('Authenticated successfully');

    // Step 2: Create push payment in Nequi
    console.log('Creating push payment...');

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = psychologistPhone.replace(/\D/g, '');

    // Generate unique message ID
    const messageId = `WISELIFE-${appointmentId.substring(0, 8)}-${Date.now()}`;

    const paymentPayload = {
      RequestMessage: {
        RequestHeader: {
          Channel: 'PNP04-C001',
          RequestDate: new Date().toISOString(),
          MessageID: messageId,
          ClientID: nequiClientId,
          Destination: {
            ServiceName: 'PaymentsService',
            ServiceOperation: 'generatePushPayment',
            ServiceRegion: 'C001',
            ServiceVersion: '1.0.0',
          },
        },
        RequestBody: {
          any: {
            generatePushPaymentRQ: {
              phoneNumber: cleanPhone, // Número del psicólogo que recibe el pago
              value: amount.toString(),
              code: messageId.substring(0, 10), // Código único (máx 10 caracteres)
              reference: `Sesión psicológica - ${patientName}`,
            },
          },
        },
      },
    };

    const paymentResponse = await fetch(`${nequiBaseUrl}/payments/v2/-services-paymentservice-generatepushpayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'x-api-key': nequiApiKey,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Nequi payment error:', errorText);
      throw new Error(`Nequi payment creation failed: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Push payment created:', paymentData);

    // Extract transaction data from Nequi response
    const transactionId = paymentData.ResponseMessage?.ResponseBody?.any?.generatePushPaymentRS?.transactionId || messageId;
    const pushToken = paymentData.ResponseMessage?.ResponseBody?.any?.generatePushPaymentRS?.pushToken || '';

    // Step 3: Get appointment and psychologist details
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('patient_id, psychologist_id')
      .eq('id', appointmentId)
      .single();

    if (apptError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Step 4: Create transaction record in database
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        psychologist_id: appointment.psychologist_id,
        amount: amount,
        currency: 'COP',
        nequi_transaction_id: transactionId,
        nequi_push_token: pushToken,
        nequi_phone_number: cleanPhone,
        status: 'processing',
        payment_method: 'nequi',
        webhook_data: paymentData,
      })
      .select()
      .single();

    if (txError) {
      console.error('Database error:', txError);
      throw new Error('Failed to create transaction record');
    }

    console.log('Transaction created:', transaction.id);

    // Step 5: Update appointment payment status
    await supabase
      .from('appointments')
      .update({
        payment_status: 'procesando',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        nequiTransactionId: transactionId,
        message: 'Push payment enviado. Revisa tu celular para autorizar el pago.',
        status: 'processing',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-nequi-payment:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al procesar el pago',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
