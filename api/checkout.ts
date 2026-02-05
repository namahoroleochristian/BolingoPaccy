// api/checkout.ts
// Handles Pesapal payment initiation

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

interface CheckoutRequest {
  body: {
    email: string;
    mediaIds: string[];
    amount: number;
  };
}

interface Response {
  status: (code: number) => {
    json: (data: Record<string, unknown>) => void;
  };
}

export async function handleCheckout(req: CheckoutRequest, res: Response) {
  const { email, mediaIds, amount } = req.body;

  try {
    // 1. Create a pending order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          email,
          media_ids: mediaIds,
          amount,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Mock Pesapal Redirect
    // In a real scenario, you would call Pesapal API here to get a redirect URL
    const mockPesapalRedirectUrl = `https://mock-pesapal.com/pay?orderId=${order.id}&amount=${amount}`;

    return res.status(200).json({ redirectUrl: mockPesapalRedirectUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
