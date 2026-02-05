// api/webhook.ts
// Handles Pesapal IPN (Instant Payment Notification)

import { createClient } from '@supabase/supabase-js';

// Use service role key for admin actions (shadow account creation)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface WebhookRequest {
  body: {
    pesapal_transaction_tracking_id: string;
    pesapal_merchant_reference: string;
    status: string;
  };
}

interface Response {
  status: (code: number) => {
    send: (data: string) => void;
    json: (data: Record<string, unknown>) => void;
  };
}

export async function handleWebhook(req: WebhookRequest, res: Response) {
  const { pesapal_transaction_tracking_id, pesapal_merchant_reference, status } = req.body;

  if (status !== 'COMPLETED') {
    return res.status(200).send('Ignored');
  }

  try {
    // 1. Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', pesapal_merchant_reference)
      .single();

    if (orderError || !order) throw new Error('Order not found');

    // 2. Silent Onboarding: Check if user exists via profiles table
    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, purchased_items')
      .eq('email', order.email)
      .maybeSingle();

    if (profileFetchError) throw profileFetchError;

    let userId = profile?.id;

    if (!profile) {
      // Create shadow account in Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: order.email,
        email_confirm: true,
        user_metadata: { shadow_account: true }
      });

      if (createError) throw createError;
      userId = newUser.user.id;

      // Create profile
      const { error: profileInsertError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: userId, email: order.email, purchased_items: order.media_ids }]);

      if (profileInsertError) throw profileInsertError;
    } else {
      // Update existing profile with new media
      const updatedItems = Array.from(new Set([...(profile.purchased_items || []), ...order.media_ids]));

      await supabaseAdmin
        .from('profiles')
        .update({ purchased_items: updatedItems })
        .eq('id', userId);
    }

    // 3. Generate Magic Link (Sent via email automatically by Supabase if configured,
    // or we can manually send it here via an email provider).
    // For this flow, we assume Supabase handles the email or the user will
    // request one if they didn't get it.
    const { data: magicLink, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: order.email,
      options: { redirectTo: `${process.env.PUBLIC_URL || 'https://your-site.com'}/dashboard` }
    });

    if (linkError) throw linkError;

    // 4. Update order status (DO NOT store the login link in the database for security)
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'success',
        pesapal_id: pesapal_transaction_tracking_id
      })
      .eq('id', order.id);

    // In a real production system, you would trigger an email here containing the login link.
    // The action_link should NEVER be exposed in a public-readable database table.
    return res.status(200).json({ message: 'Success' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
