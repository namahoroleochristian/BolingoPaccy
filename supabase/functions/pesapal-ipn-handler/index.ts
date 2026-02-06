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

    // Get query parameters (Pesapal sends via GET)
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get('OrderTrackingId');
    const orderMerchantReference = url.searchParams.get('OrderMerchantReference');
    const orderNotificationType = url.searchParams.get('OrderNotificationType');

    console.log('IPN received:', {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationType,
    });

    if (!orderTrackingId || !orderMerchantReference) {
      console.log('Missing required parameters');
      return new Response(
        JSON.stringify({ 
          orderNotificationType,
          orderTrackingId,
          orderMerchantReference,
          status: '200',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_reference', orderMerchantReference)
      .maybeSingle();

    if (orderError || !order) {
      console.error('Order not found:', orderMerchantReference);
      return new Response(
        JSON.stringify({ 
          orderNotificationType,
          orderTrackingId,
          orderMerchantReference,
          status: '200',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check if already processed (idempotency)
    if (order.status === 'completed') {
      console.log('Order already completed:', order.id);
      return new Response(
        JSON.stringify({ 
          orderNotificationType,
          orderTrackingId,
          orderMerchantReference,
          status: '200',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get auth token to verify transaction status
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

    // Map Pesapal status to our status
    let newStatus: 'pending' | 'completed' | 'failed' = 'pending';
    const paymentStatusCode = statusData.payment_status_description?.toLowerCase();
    
    if (paymentStatusCode === 'completed' || statusData.status_code === 1) {
      newStatus = 'completed';
    } else if (paymentStatusCode === 'failed' || statusData.status_code === 2) {
      newStatus = 'failed';
    }

    console.log('Mapped status:', newStatus);

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        pesapal_tracking_id: orderTrackingId,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    // Insert payment record if completed
    if (newStatus === 'completed') {
      const { error: paymentError } = await supabase
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

      if (paymentError) {
        console.error('Error inserting payment:', paymentError);
      } else {
        console.log('Payment record created for order:', order.id);
      }
    }

    // Return success response (Pesapal expects this format)
    return new Response(
      JSON.stringify({
        orderNotificationType,
        orderTrackingId,
        orderMerchantReference,
        status: '200',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in pesapal-ipn-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
