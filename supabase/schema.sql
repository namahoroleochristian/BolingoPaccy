-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('song', 'video')),
  price NUMERIC NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  purchased_items UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success')) DEFAULT 'pending',
  pesapal_id TEXT,
  media_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Media Policies
-- Public media list is viewable by everyone (for shop)
CREATE POLICY "Public media are viewable by everyone" ON media
  FOR SELECT USING (true);

-- Only admins can insert/update/delete media
CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean) OR
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean)
  );

-- Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Orders Policies
-- Users can view their own orders based on email
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow public access to order status via ID (for Success page polling)
CREATE POLICY "Public can view order status by ID" ON orders
  FOR SELECT USING (true);
-- Note: In production, you should limit the columns returned or use a more restrictive policy.

-- Storage Policies (Conceptual)
-- Storage Setup
-- Note: Run these in the Supabase SQL Editor
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false);

-- Storage Policies
-- Allow signed URL creation (handled via service role or specific policies)
-- This policy allows users to read objects if they have purchased them.
-- Note: createSignedUrl usually bypasses RLS if using Service Role, but for client-side:
CREATE POLICY "Give users access to owned media" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'media' AND
  (SELECT purchased_items FROM profiles WHERE id = auth.uid()) @> ARRAY[(name)::UUID]
);
