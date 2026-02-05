import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: purchasedMedia, isLoading: loadingMedia } = useQuery({
    queryKey: ['purchased-media', profile?.purchased_items],
    enabled: !!profile?.purchased_items?.length,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .in('id', profile.purchased_items);
      if (error) throw error;
      return data;
    },
  });

  if (loadingProfile || loadingMedia) return <div className="container mx-auto p-12">Loading your collection...</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">My Music & Videos</h1>
      <p className="text-muted-foreground mb-8">Access your purchased content securely.</p>

      {!profile ? (
        <Card className="p-12 text-center">
          <p>Please log in to view your collection.</p>
          <Button asChild className="mt-4">
            <Link to="/checkout">Go to Checkout/Login</Link>
          </Button>
        </Card>
      ) : !purchasedMedia?.length ? (
        <Card className="p-12 text-center">
          <p>You haven't purchased any media yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Browse Shop</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {purchasedMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:border-primary transition-colors">
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                {item.thumbnail_path ? (
                  <img src={item.thumbnail_path} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  item.type === 'video' ? <Video className="h-12 w-12 text-muted-foreground" /> : <Play className="h-12 w-12 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button asChild variant="secondary">
                    <Link to={`/player/${item.id}`}>Play Now</Link>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
