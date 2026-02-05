import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface MediaFrameProps {
  mediaId: string;
  type: 'song' | 'video';
  storagePath: string;
  userEmail?: string;
}

const MediaFrame: React.FC<MediaFrameProps> = ({ mediaId, type, storagePath, userEmail }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      const { data, error } = await supabase.storage
        .from('media')
        .createSignedUrl(storagePath, 3600); // 60 minutes

      if (data) {
        setSignedUrl(data.signedUrl);
      } else {
        console.error('Error fetching signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [storagePath]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault(); // View source
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!signedUrl) {
    return <div className="animate-pulse bg-muted aspect-video rounded-lg flex items-center justify-center">Loading secure player...</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-lg bg-black group">
      {/* Watermark Overlay */}
      {userEmail && (
        <div className="absolute inset-0 pointer-events-none z-50 select-none overflow-hidden opacity-[0.07]">
          <div className="absolute inset-[-50%] flex flex-wrap gap-x-24 gap-y-16 p-4 justify-around items-center rotate-[-25deg]">
            {Array(100).fill(0).map((_, i) => (
              <span key={i} className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
                {userEmail}
              </span>
            ))}
          </div>
        </div>
      )}

      {type === 'video' ? (
        <video
          src={signedUrl}
          controls
          controlsList="nodownload"
          className="w-full h-full"
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-zinc-900 to-black">
          <audio
            src={signedUrl}
            controls
            controlsList="nodownload"
            className="w-full max-w-md"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
};

export default MediaFrame;
