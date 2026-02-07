import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, Music, ShoppingCart, Lock, Unlock } from "lucide-react";
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
}

const Album = () => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
        const { data: purchaseData } = await supabase
          .from("orders")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("album_id", albumData.id)
          .eq("status", "completed")
          .maybeSingle();

        setHasPurchased(!!purchaseData);
      }

      setLoading(false);
    };

    fetchAlbumData();
  }, [user]);

  const handleBuyNow = () => {
    if (!album) return;
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
    
    toast({
      title: "Now Playing",
      description: song.title,
    });
  };

  // // Fallback tracks for display if no songs in database
  // const displayTracks = songs.length > 0 ? songs : [
  //   { id: "1", track_number: 1, title: "Inyenyeri", duration: "4:32", is_preview: true },
  //   { id: "2", track_number: 2, title: "Umucancuro", duration: "3:45", is_preview: false },
  //   { id: "3", track_number: 3, title: "Inzozi", duration: "5:12", is_preview: false },
  //   { id: "4", track_number: 4, title: "Urukundo", duration: "4:18", is_preview: false },
  //   { id: "5", track_number: 5, title: "Ubumuntu", duration: "3:56", is_preview: false },
  //   { id: "6", track_number: 6, title: "Amahoro", duration: "4:43", is_preview: false },
  // ];

  // const displayAlbum = album || {
  //   id: "default",
  //   title: "Inyenyeri",
  //   description: "Inyenyeri (The Stars) is a masterful blend of traditional African rhythms and contemporary soundscapes. Each track tells a story of heritage, love, and the human experience, woven together with the distinctive sound of the umucancuro instrument.",
  //   price: 500,
  //   currency: "KES",
  //   cover_url: null,
  // };
  if (loading) {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      Loading album...
    </div>
  );
}

if (!album) {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      No album available
    </div>
  );
}


  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Album Cover */}
          <div className="animate-slide-in">
            <Card className="bg-card border-border overflow-hidden">
              <img
                src={album.cover_url || albumCover}
                alt={album.title}
                className="w-full h-auto"
              />
            </Card>
          </div>

          {/* Album Info */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <p className="text-primary text-sm uppercase tracking-wider mb-2">Album</p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4">{album.title}</h1>
              <p className="text-xl text-muted-foreground">by Bolingo Paccy</p>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <p><span className="text-foreground font-semibold">Released:</span> 2024</p>
              <p><span className="text-foreground font-semibold">Genre:</span> Afro-fusion, Traditional</p>
              <p><span className="text-foreground font-semibold">Duration:</span> 26:26</p>
              <p className="text-2xl font-bold text-[#895B26]">
                {album.currency} {album.price.toFixed(2)}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {album.description}
            </p>

            <div className="flex gap-4 pt-4">
              {hasPurchased ? (
                <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                  <Unlock className="h-5 w-5" />
                  Album Owned
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-[#895B26] hover:bg-[#895B26]/90 gap-2"
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                </Button>
              )}
              <Button size="lg" variant="outline" className="gap-2">
                <Music className="h-5 w-5" />
                Add to Library
              </Button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold mb-6">Tracklist</h2>
          {songs.map((track, index) => {
            const isLocked = !hasPurchased && !track.is_preview;
            
            return (
              <Card
                key={track.id}
                className={`bg-card border-border hover:border-primary transition-all p-4 group animate-slide-up ${
                  isLocked ? "opacity-75" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-8">{track.track_number}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`hover:bg-primary hover:text-primary-foreground ${
                      isLocked ? "cursor-not-allowed" : ""
                    }`}
                    onClick={() => handlePlayTrack(track as Song)}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="flex-1 font-medium group-hover:text-primary transition-colors">
                    {track.title}
                    {track.is_preview && (
                      <span className="ml-2 text-xs text-muted-foreground">(Preview)</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">{track.duration}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Album;
