-- Fix security warnings: Drop overly permissive policies and create proper ones

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can manage pesapal config" ON public.pesapal_config;

-- Create proper policies for orders (edge functions will use service role key)
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can update own pending orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Note: Edge functions use service role which bypasses RLS
-- This is intentional for IPN handler to update any order

-- Create proper policies for payments
-- Users can only view their own payments (already exists)
-- Edge functions will insert payments using service role

-- Add policy for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);