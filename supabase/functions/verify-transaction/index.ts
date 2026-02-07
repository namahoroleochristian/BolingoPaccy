import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiUrl = Deno.env.get('PESAPAL_API_URL')!;
    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY')!;
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order tracking ID from query params or body
    const url = new URL(req.url);
    let orderTrackingId = url.searchParams.get('orderTrackingId');
    let merchantReference = url.searchParams.get('merchantReference');

    if (req.method === 'POST') {
      const body = await req.json();
      orderTrackingId = orderTrackingId || body.orderTrackingId;
      merchantReference = merchantReference || body.merchantReference;
    }

    if (!orderTrackingId && !merchantReference) {
      throw new Error('Either orderTrackingId or merchantReference is required');
    }

    console.log('Verifying transaction:', { orderTrackingId, merchantReference });

    // Find order if we have merchant reference
    let order = null;
    if (merchantReference) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_reference', merchantReference)
        .maybeSingle();
      order = data;
      orderTrackingId = orderTrackingId || order?.pesapal_tracking_id;
    }

    if (!orderTrackingId) {
      throw new Error('Order tracking ID not found');
    }

    // Get auth token
    const authResponse = await fetch(`${apiUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    const authData = await authResponse.json();
    if (!authData.token) {
      throw new Error('Failed to get Pesapal auth token');
    }

    // Get transaction status
    const statusResponse = await fetch(
      `${apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
      }
    );

    const statusData = await statusResponse.json();
    console.log('Transaction status:', statusData);

    // Map status
    let paymentStatus = 'pending';
    const statusDescription = statusData.payment_status_description?.toLowerCase();
    
    if (statusDescription === 'completed' || statusData.status_code === 1) {
      paymentStatus = 'completed';
    } else if (statusDescription === 'failed' || statusData.status_code === 2) {
      paymentStatus = 'failed';
    }

    // Update order if found
    if (order) {
      await supabase
        .from('orders')
        .update({
          status: paymentStatus as any,
          pesapal_tracking_id: orderTrackingId,
        })
        .eq('id', order.id);

      // Create payment record if completed and doesn't exist
      if (paymentStatus === 'completed') {
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', order.id)
          .maybeSingle();

        if (!existingPayment) {
          await supabase
            .from('payments')
            .insert({
              order_id: order.id,
              payment_status: 'completed',
              payment_method: statusData.payment_method || null,
              pesapal_transaction_id: statusData.confirmation_code || orderTrackingId,
              amount: statusData.amount || order.amount,
              currency: statusData.currency || order.currency,
              raw_response: statusData,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: paymentStatus,
        order_tracking_id: orderTrackingId,
        merchant_reference: merchantReference || order?.merchant_reference,
        payment_method: statusData.payment_method,
        confirmation_code: statusData.confirmation_code,
        raw_status: statusData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
