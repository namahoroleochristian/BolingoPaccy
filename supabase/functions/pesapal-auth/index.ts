import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: {
    error_type: string;
    code: string;
    message: string;
  };
  status: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    const apiUrl = Deno.env.get('PESAPAL_API_URL');

    if (!consumerKey || !consumerSecret || !apiUrl) {
      console.error('Missing Pesapal credentials');
      throw new Error('Pesapal credentials not configured');
    }

    console.log('Requesting Pesapal auth token from:', `${apiUrl}/api/Auth/RequestToken`);

    const response = await fetch(`${apiUrl}/api/Auth/RequestToken`, {
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

    const data: PesapalAuthResponse = await response.json();
    console.log('Pesapal auth response status:', data.status);

    if (data.error || data.status !== '200') {
      console.error('Pesapal auth error:', data.error || data.message);
      throw new Error(data.error?.message || data.message || 'Failed to authenticate with Pesapal');
    }

    return new Response(
      JSON.stringify({
        token: data.token,
        expiryDate: data.expiryDate,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in pesapal-auth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
