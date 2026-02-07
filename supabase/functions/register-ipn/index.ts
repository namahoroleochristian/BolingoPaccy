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

    // Check if we already have a notification_id stored
    const { data: existingConfig } = await supabase
      .from('pesapal_config')
      .select('value')
      .eq('key', 'notification_id')
      .maybeSingle();

    if (existingConfig?.value) {
      console.log('IPN already registered, notification_id:', existingConfig.value);
      return new Response(
        JSON.stringify({ notification_id: existingConfig.value, message: 'IPN already registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get auth token first
    console.log('Getting auth token...');
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
      throw new Error('Failed to get auth token');
    }

    const token = authData.token;
    console.log('Got auth token');

    // Build IPN URL - this should be the pesapal-ipn-handler function URL
    const ipnUrl = `${supabaseUrl}/functions/v1/pesapal-ipn-handler`;
    console.log('Registering IPN URL:', ipnUrl);

    // Register IPN URL
    const ipnResponse = await fetch(`${apiUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'GET',
      }),
    });

    const ipnData = await ipnResponse.json();
    console.log('IPN registration response:', ipnData);

    if (ipnData.error || !ipnData.ipn_id) {
      throw new Error(ipnData.error?.message || 'Failed to register IPN URL');
    }

    // Store the notification_id
    const { error: insertError } = await supabase
      .from('pesapal_config')
      .upsert({
        key: 'notification_id',
        value: ipnData.ipn_id,
      });

    if (insertError) {
      console.error('Error storing notification_id:', insertError);
      throw new Error('Failed to store notification_id');
    }

    console.log('IPN registered successfully, notification_id:', ipnData.ipn_id);

    return new Response(
      JSON.stringify({
        notification_id: ipnData.ipn_id,
        message: 'IPN registered successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in register-ipn:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
