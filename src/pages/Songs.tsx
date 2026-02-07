import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, ExternalLink, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Song {
  id: string;
  title: string;
  track_number: number;
  duration: string | null;
  is_preview: boolean;
  audio_url: string | null;
  album_id: string;
}

// Extended song type with additional fields for display
interface DisplaySong extends Song {
  youtube_url?: string;
  thumbnail_url?: string;
  type: "audio" | "video";
}

const Songs = () => {
  const [songs, setSongs] = useState<DisplaySong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<DisplaySong | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data: songsData, error } = await supabase
          .from("songs")
          .select("*")
          .order("track_number");

        if (error) throw error;

        // Add display properties
        const displaySongs: DisplaySong[] = (songsData || []).map((song, index) => ({
          ...song,
          // Alternate between video and audio for demo - in production this would come from DB
          type: index % 3 === 0 ? "video" : "audio",
          youtube_url: index % 3 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
          thumbnail_url: index % 3 === 0 
            ? `https://images.unsplash.com/photo-${1493225457124 + index}-a3eb161ffa5f?w=400`
            : undefined,
        }));

        setSongs(displaySongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">Songs</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Songs</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Listen to singles, watch music videos, and explore the complete collection
        </p>

        {songs.length === 0 ? (
          <div className="text-center py-20">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No songs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {songs.map((song, index) => (
              <Card
                key={song.id}
                className="bg-card border-border overflow-hidden group cursor-pointer animate-slide-up transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedSong(song)}
              >
                <AspectRatio ratio={1}>
                  <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                    {song.type === "video" && song.thumbnail_url ? (
                      <img
                        src={song.thumbnail_url}
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
                        <Music className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-primary rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        {song.type === "video" ? (
                          <Youtube className="h-8 w-8 text-primary-foreground" />
                        ) : (
                          <Play className="h-8 w-8 text-primary-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        song.type === "video" 
                          ? "bg-red-500 text-white" 
                          : "bg-primary text-primary-foreground"
                      }`}>
                        {song.type === "video" ? "Video" : "Audio"}
                      </div>
                    </div>

                    {/* Track Number */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white/80 text-sm font-bold">
                        #{String(song.track_number).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </AspectRatio>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {song.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      {song.duration || "3:00"}
                    </span>
                    {song.is_preview && (
                      <span className="text-xs text-primary font-medium">Preview</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Song Modal */}
        {selectedSong && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedSong(null)}
          >
            <Card
              className="relative max-w-lg w-full bg-card border-border p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => setSelectedSong(null)}
              >
                ✕
              </Button>

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  {selectedSong.type === "video" && selectedSong.thumbnail_url ? (
                    <img
                      src={selectedSong.thumbnail_url}
                      alt={selectedSong.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="h-16 w-16 text-primary" />
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">{selectedSong.title}</h2>
                <p className="text-muted-foreground mb-1">Bolingo Paccy</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Track {selectedSong.track_number} • {selectedSong.duration || "3:00"}
                </p>

                <div className="flex gap-3 justify-center">
                  {selectedSong.type === "video" && selectedSong.youtube_url ? (
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                      <a href={selectedSong.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2 h-5 w-5" />
                        Watch on YouTube
                      </a>
                    </Button>
                  ) : (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="mr-2 h-5 w-5" />
                      Play Audio
                    </Button>
                  )}
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Songs;
