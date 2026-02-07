import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  album_id: string;
  customer_email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  callback_url: string;
}

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

    // Get user from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabase.auth.getClaims(token);
      userId = claimsData?.claims?.sub || null;
    }

    // Parse request body
    const body: OrderRequest = await req.json();
    const { album_id, customer_email, customer_first_name, customer_last_name, callback_url } = body;

    if (!album_id || !customer_email || !callback_url) {
      throw new Error('Missing required fields: album_id, customer_email, callback_url');
    }

    console.log('Creating order for album:', album_id);

    // Get album details
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('*')
      .eq('id', album_id)
      .single();

    if (albumError || !album) {
      throw new Error('Album not found');
    }

    // Get notification_id from config
    const { data: config } = await supabase
      .from('pesapal_config')
      .select('value')
      .eq('key', 'notification_id')
      .maybeSingle();

    if (!config?.value) {
      throw new Error('IPN not registered. Please register IPN first.');
    }

    const notificationId = config.value;

    // Generate unique merchant reference
    const merchantReference = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        album_id: album_id,
        merchant_reference: merchantReference,
        notification_id: notificationId,
        amount: album.price,
        currency: album.currency,
        status: 'pending',
        customer_email: customer_email,
        customer_first_name: customer_first_name || null,
        customer_last_name: customer_last_name || null,
        callback_url: callback_url,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order.id);

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

    console.log('Got Pesapal auth token');

    // Submit order to Pesapal
    const pesapalOrderRequest = {
      id: merchantReference,
      currency: album.currency,
      amount: parseFloat(album.price),
      description: `Purchase: ${album.title}`,
      callback_url: callback_url,
      notification_id: notificationId,
      billing_address: {
        email_address: customer_email,
        first_name: customer_first_name || 'Customer',
        last_name: customer_last_name || '',
      },
    };

    console.log('Submitting order to Pesapal:', pesapalOrderRequest);

    const orderResponse = await fetch(`${apiUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
      },
      body: JSON.stringify(pesapalOrderRequest),
    });

    const pesapalOrder = await orderResponse.json();
    console.log('Pesapal order response:', pesapalOrder);

    if (pesapalOrder.error || !pesapalOrder.redirect_url) {
      console.error('Pesapal order error:', pesapalOrder);
      // Update order status to failed
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);
      throw new Error(pesapalOrder.error?.message || 'Failed to submit order to Pesapal');
    }

    // Update order with tracking ID
    await supabase
      .from('orders')
      .update({
        pesapal_tracking_id: pesapalOrder.order_tracking_id,
      })
      .eq('id', order.id);

    console.log('Order submitted successfully, redirect_url:', pesapalOrder.redirect_url);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        merchant_reference: merchantReference,
        redirect_url: pesapalOrder.redirect_url,
        order_tracking_id: pesapalOrder.order_tracking_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
