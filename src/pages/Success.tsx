import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'polling' | 'success' | 'error'>('polling');
  const [message, setMessage] = useState('Verifying your payment...');
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setMessage('No order ID found.');
      return;
    }

    const pollOrder = async () => {
      let attempts = 0;
      const maxAttempts = 20; // Poll for 2 minutes (6s interval)

      const interval = setInterval(async () => {
        attempts++;
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('Error polling order:', error);
        } else if (data?.status === 'success') {
          clearInterval(interval);
          setStatus('success');
          setMessage('Payment successful! Check your email for your secure access link.');

          // We can't automatically log in from the frontend safely without the link
          // but we can provide a button to the dashboard once they are logged in.
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatus('error');
          setMessage('Verification taking longer than expected. Please check your email for access.');
        }
      }, 6000);

      return () => clearInterval(interval);
    };

    pollOrder();
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'polling' && (
          <>
            <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold">Verifying Payment</h1>
            <p className="text-zinc-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Thank You!</h1>
            <p className="text-zinc-400">{message}</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to My Music
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              !
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-zinc-400">{message}</p>
            <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Success;
