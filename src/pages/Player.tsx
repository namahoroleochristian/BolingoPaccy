import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import MediaFrame from '@/components/MediaFrame';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Player = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media-item', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading player...</div>;
  if (error || !media) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Media not found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 text-white">
          <Link to="/dashboard">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">{media.title}</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-5xl aspect-video">
          <MediaFrame
            mediaId={media.id}
            type={media.type}
            storagePath={media.storage_path}
            userEmail={user?.email}
          />
        </div>
      </div>

      <div className="p-8 text-center text-zinc-500 text-sm">
        Protected content. Unauthorized recording or distribution is strictly prohibited.
      </div>
    </div>
  );
};

export default Player;
