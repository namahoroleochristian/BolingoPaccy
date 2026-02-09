import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Song {
  id: string;
  title: string;
  duration: string | null;
  featured?: boolean;
  track_number: number;
}

const Songs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data: songsData } = await supabase
          .from("songs")
          .select("*")
          .order("track_number");
        setSongs(songsData || []);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } 
    };
    fetchSongs();
  }, []);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in text-foreground">Songs</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Explore the complete collection from the Inyenyeri Album
        </p>

        <div className="space-y-4">
          {songs.map((song, index) => (
            <Card
              key={song.id}
              className="bg-card border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all animate-slide-up p-6 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-colors"
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-[hsl(var(--primary))] transition-colors text-foreground">
                      {song.title}
                    </h3>
                    {song.featured && (
                      <span className="text-xs text-[hsl(var(--primary))]">Featured Track</span>
                    )}
                  </div>
                </div>

                <span className="text-muted-foreground">{song.duration}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Songs;