import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, ShoppingCart, Lock, Unlock, Pause, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  cover_url: string | null;
}

interface Song {
  id: string;
  title: string;
  track_number: number;
  duration: string | null;
  is_preview: boolean;
  audio_url?: string | null;
}

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      navigate("/album");
      return;
    }

    const fetchAlbumData = async () => {
      try {
        const { data: albumData, error: albumError } = await supabase
          .from("albums")
          .select("*")
          .eq("id", id)
          .single();

        if (albumError || !albumData) {
          navigate("/album");
          return;
        }

        setAlbum(albumData);

        const { data: songsData } = await supabase
          .from("songs")
          .select("*")
          .eq("album_id", id)
          .order("track_number");

        setSongs(songsData || []);

        if (user) {
          const { data: purchaseData } = await supabase
            .from("orders")
            .select("id, status")
            .eq("customer_email", user.email)
            .eq("album_id", id)
            .eq("status", "completed")
            .maybeSingle();

          setHasPurchased(!!purchaseData);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id, user, navigate]);

  const handleBuyNow = () => {
    if (!album) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase this album.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    navigate(`/checkout?album=${album.id}`);
  };

  const handlePlayTrack = (song: Song) => {
    if (!hasPurchased && !song.is_preview) {
      toast({
        title: "Purchase Required",
        description: "Buy the album to unlock all tracks.",
        variant: "destructive",
      });
      return;
    }

    if (currentlyPlaying === song.id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(song.id);
      toast({
        title: "Now Playing",
        description: `${song.title}${hasPurchased ? '' : ' (Preview)'}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/album")}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Albums
        </Button>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Album Cover */}
          <Card className="overflow-hidden border-0 shadow-2xl shadow-primary/10 animate-scale-in">
            <img
              src={album.cover_url || albumCover}
              alt={album.title}
              className="w-full aspect-square object-cover"
            />
          </Card>

          {/* Album Info */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">
                Album
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {album.title}
              </h1>
              <p className="text-lg text-muted-foreground">by Bolingo Paccy</p>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <p>Released: 2024</p>
              <p>Genre: Afro-fusion, Traditional</p>
              <p className="text-3xl font-bold text-foreground mt-4">
                {album.currency} {album.price.toLocaleString()}
              </p>
            </div>

            {album.description && (
              <p className="text-muted-foreground leading-relaxed">{album.description}</p>
            )}

            <div className="flex gap-4">
              {hasPurchased ? (
                <Button
                  className="flex-1 bg-primary/20 text-primary border border-primary cursor-default"
                  disabled
                >
                  <Unlock className="mr-2 h-5 w-5" />
                  Album Owned
                </Button>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              )}
            </div>

            {hasPurchased && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-primary text-sm font-medium">
                  ✓ You own this album - All tracks are unlocked
                </p>
              </div>
            )}

            {!hasPurchased && user && (
              <div className="bg-muted border border-border rounded-lg p-4">
                <p className="text-muted-foreground text-sm font-medium">
                  🔒 Purchase this album to unlock all tracks
                </p>
              </div>
            )}

            {!user && (
              <div className="bg-muted border border-border rounded-lg p-4">
                <p className="text-muted-foreground text-sm font-medium">
                  ℹ️ Log in to purchase and access full tracks
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Track List */}
        <Card className="bg-card border-border p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Tracklist</h2>
          <div className="space-y-2">
            {songs.map((track) => {
              const isLocked = !hasPurchased && !track.is_preview;
              const isPlaying = currentlyPlaying === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isLocked
                      ? "bg-muted/50 cursor-not-allowed opacity-60"
                      : "bg-muted/30 hover:bg-primary/10 cursor-pointer"
                  } ${isPlaying ? "bg-primary/20 ring-2 ring-primary" : ""}`}
                  onClick={() => !isLocked && handlePlayTrack(track)}
                >
                  <span className="text-muted-foreground w-8 text-center font-medium">
                    {track.track_number}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-10 w-10 rounded-full ${
                      isLocked
                        ? "bg-muted text-muted-foreground"
                        : isPlaying
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) handlePlayTrack(track);
                    }}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className={`font-medium ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                      {track.title}
                    </p>
                    {track.is_preview && !hasPurchased && (
                      <span className="text-xs text-primary">(Preview)</span>
                    )}
                  </div>
                  <span className={`text-sm ${isLocked ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                    {track.duration}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AlbumDetail;
