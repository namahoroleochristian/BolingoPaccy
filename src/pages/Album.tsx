import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, Music, ShoppingCart, Lock, Unlock, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: string;
  title: string;
  description: string;
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

const Album = () => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlbumData = async () => {
      // Fetch first active album
      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (albumError) {
        console.error("Error fetching album:", albumError);
        setLoading(false);
        return;
      }

      if (!albumData) {
        setLoading(false);
        return;
      }

      setAlbum(albumData);

      // Fetch songs
      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .eq("album_id", albumData.id)
        .order("track_number");

      setSongs(songsData || []);

      // Check purchase status if logged in
      if (user) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_email", user.email)
          .eq("album_id", albumData.id)
          .eq("status", "completed")
          .maybeSingle();

        if (purchaseError) {
          console.error("Error checking purchase status:", purchaseError);
        }

        const purchased = !!purchaseData;
        setHasPurchased(purchased);
        console.log("Purchase status for user:", user.email, "- Purchased:", purchased);
        
        if (purchased) {
          toast({
            title: "Album Owned",
            description: "You can play all tracks from this album!",
            duration: 3000,
          });
        }
      } else {
        setHasPurchased(false);
      }

      setLoading(false);
    };

    fetchAlbumData();
  }, [user, toast]);

  // Re-check purchase status when user changes
  useEffect(() => {
    if (user && album) {
      const checkPurchase = async () => {
        const { data: purchaseData } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_email", user.email)
          .eq("album_id", album.id)
          .eq("status", "completed")
          .maybeSingle();

        setHasPurchased(!!purchaseData);
      };

      checkPurchase();
    }
  }, [user, album]);

  const handleBuyNow = () => {
    if (!album) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase this album.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    navigate(`/checkout?album=${album.id}`);
  };

  const handlePlayTrack = (song: Song) => {
    // If user hasn't purchased and it's not a preview, block playback
    if (!hasPurchased && !song.is_preview) {
      toast({
        title: "Purchase Required",
        description: "Buy the album to unlock all tracks.",
        variant: "destructive",
      });
      return;
    }

    // Toggle play/pause for the same track
    if (currentlyPlaying === song.id) {
      setCurrentlyPlaying(null);
      toast({
        title: "Paused",
        description: song.title,
      });
    } else {
      setCurrentlyPlaying(song.id);
      toast({
        title: "Now Playing",
        description: `${song.title}${hasPurchased ? ' (Full Version)' : ' (Preview)'}`,
      });
      
      // Here you would integrate with an actual audio player
      // For example, if you have an audio_url in your song data:
      if (song.audio_url) {
        console.log("Playing audio from:", song.audio_url);
        // Implement actual audio playback here
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-amber-900">
        <div className="text-amber-100 text-xl">Loading album...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-amber-900">
        <div className="text-amber-100 text-xl">No album available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Album Cover */}
          <Card className="overflow-hidden bg-white/10 backdrop-blur-lg border-white/20">
            <img
              src={album.cover_url || albumCover}
              alt={album.title}
              className="w-full aspect-square object-cover"
            />
          </Card>

          {/* Album Info */}
          <div className="text-white space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-amber-400 mb-2">
                Album
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {album.title}
              </h1>
              <p className="text-lg text-amber-200">by Bolingo Paccy</p>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>Released: 2024</p>
              <p>Genre: Afro-fusion, Traditional</p>
              <p>Duration: 26:26</p>
              <p className="text-2xl font-bold text-white mt-4">
                {album.currency} {album.price.toFixed(2)}
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">{album.description}</p>

            <div className="flex gap-4">
              {hasPurchased ? (
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-black font-semibold"
                  disabled
                >
                  <Unlock className="mr-2 h-5 w-5" />
                  Album Owned
                </Button>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              )}
              <Button
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              >
                <Music className="mr-2 h-5 w-5" />
                Add to Library
              </Button>
            </div>

            {/* Purchase Status Indicator */}
            {hasPurchased && (
              <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-4">
                <p className="text-amber-300 text-sm font-medium">
                  ✓ You own this album - All tracks are unlocked
                </p>
              </div>
            )}

            {!hasPurchased && user && (
              <div className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-4">
                <p className="text-orange-300 text-sm font-medium">
                  🔒 Purchase this album to unlock all tracks
                </p>
              </div>
            )}

            {!user && (
              <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-4">
                <p className="text-amber-300 text-sm font-medium">
                  ℹ️ Log in to purchase and access full tracks
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Track List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Tracklist</h2>
          <div className="space-y-2">
            {songs.map((track) => {
              const isLocked = !hasPurchased && !track.is_preview;
              const isPlaying = currentlyPlaying === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isLocked
                      ? "bg-gray-800/30 cursor-not-allowed opacity-60"
                      : "bg-white/5 hover:bg-amber-500/10 cursor-pointer"
                  } ${isPlaying ? "bg-amber-600/30 ring-2 ring-amber-500" : ""}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <span className="text-gray-400 w-8 text-center">
                    {track.track_number}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-10 w-10 rounded-full ${
                      isLocked
                        ? "bg-gray-700 text-gray-400"
                        : isPlaying
                        ? "bg-amber-600 hover:bg-amber-700 text-black"
                        : "bg-amber-500 hover:bg-amber-600 text-black"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
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
                    <p className={`font-medium ${isLocked ? "text-gray-500" : "text-white"}`}>
                      {track.title}
                    </p>
                    {track.is_preview && !hasPurchased && (
                      <span className="text-xs text-amber-400">(Preview)</span>
                    )}
                  </div>
                  <span className={`text-sm ${isLocked ? "text-gray-600" : "text-gray-400"}`}>
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

export default Album;