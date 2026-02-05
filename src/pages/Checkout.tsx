import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
}

const Checkout = () => {
  const [email, setEmail] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          email,
          amount: total,
          media_ids: cart.map(i => i.id),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Mocking the Pesapal redirect
      // In a real app, you'd call a backend that returns a Pesapal redirect URL
      toast.success('Redirecting to Pesapal...');

      setTimeout(() => {
        // Clear cart
        localStorage.removeItem('cart');

        // Simulating redirect back from Pesapal to our Success page
        window.location.href = `/success?order_id=${order.id}`;
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.title}</span>
                  <span>${item.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              We'll use this email to create your secure account and send your access link.
            </p>
          </div>

          <Button
            className="w-full text-lg py-6"
            disabled={isProcessing || cart.length === 0 || !email}
            onClick={handleCheckout}
          >
            {isProcessing ? 'Processing...' : `Pay with Pesapal`}
          </Button>
        </div>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Secure payment via Pesapal. By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
};

export default Checkout;
