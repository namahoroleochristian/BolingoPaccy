import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, Music, ShoppingCart, Lock, Unlock, Pause, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all albums on mount
  useEffect(() => {
    const fetchAlbums = async () => {
      const { data: albumsData, error: albumsError } = await supabase
        .from("albums")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (albumsError) {
        console.error("Error fetching albums:", albumsError);
        setLoading(false);
        return;
      }

      setAlbums(albumsData || []);

      // Set initial album based on URL param or first album
      const albumIdFromUrl = searchParams.get("id");
      let initialAlbum: Album | null = null;

      if (albumIdFromUrl) {
        initialAlbum = albumsData?.find(a => a.id === albumIdFromUrl) || null;
      }
      
      if (!initialAlbum && albumsData && albumsData.length > 0) {
        initialAlbum = albumsData[0];
        setSearchParams({ id: albumsData[0].id });
      }

      setCurrentAlbum(initialAlbum);
      setLoading(false);
    };

    fetchAlbums();
  }, []);

  // Fetch songs and purchase status when album changes
  useEffect(() => {
    if (!currentAlbum) return;

    const fetchAlbumData = async () => {
      // Fetch songs
      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .eq("album_id", currentAlbum.id)
        .order("track_number");

      setSongs(songsData || []);

      // Check purchase status if logged in
      if (user) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_email", user.email)
          .eq("album_id", currentAlbum.id)
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
    };

    fetchAlbumData();
    setCurrentlyPlaying(null); // Reset playing track when switching albums
  }, [currentAlbum, user, toast]);

  const handleAlbumChange = (album: Album) => {
    setCurrentAlbum(album);
    setSearchParams({ id: album.id });
  };

  const handlePreviousAlbum = () => {
    if (!currentAlbum || albums.length === 0) return;
    const currentIndex = albums.findIndex(a => a.id === currentAlbum.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : albums.length - 1;
    handleAlbumChange(albums[previousIndex]);
  };

  const handleNextAlbum = () => {
    if (!currentAlbum || albums.length === 0) return;
    const currentIndex = albums.findIndex(a => a.id === currentAlbum.id);
    const nextIndex = currentIndex < albums.length - 1 ? currentIndex + 1 : 0;
    handleAlbumChange(albums[nextIndex]);
  };

  const handleBuyNow = () => {
    if (!currentAlbum) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase this album.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    navigate(`/checkout?album=${currentAlbum.id}`);
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
      if (song.audio_url) {
        console.log("Playing audio from:", song.audio_url);
        // Implement actual audio playback here
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">Loading albums...</div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">No albums available</div>
      </div>
    );
  }

  if (!currentAlbum) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">No album selected</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Album Navigation - Only show if multiple albums */}
        {albums.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousAlbum}
                className="border-border hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="text-center">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Album {albums.findIndex(a => a.id === currentAlbum.id) + 1} of {albums.length}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextAlbum}
                className="border-border hover:bg-accent"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Album Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumChange(album)}
                  className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    currentAlbum.id === album.id
                      ? "bg-[#895B26] text-white"
                      : "bg-card border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {album.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Album Cover */}
          <Card className="overflow-hidden bg-card border-border">
            <img
              src={currentAlbum.cover_url || albumCover}
              alt={currentAlbum.title}
              className="w-full aspect-square object-cover"
            />
          </Card>

          {/* Album Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-[#895B26] mb-2">
                Album
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
                {currentAlbum.title}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">by Bolingo Paccy</p>
            </div>

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p>Released: 2024</p>
              <p>Genre: Afro-fusion, Traditional</p>
              <p>Tracks: {songs.length}</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-3 sm:mt-4">
                {currentAlbum.currency} {currentAlbum.price.toFixed(2)}
              </p>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {currentAlbum.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {hasPurchased ? (
                <Button
                  className="flex-1 bg-[#895B26] hover:bg-[#895B26]/90 text-white font-semibold"
                  disabled
                >
                  <Unlock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Album Owned
                </Button>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#895B26] hover:bg-[#895B26]/90 text-white font-semibold"
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Buy Now
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 border-border hover:bg-accent"
              >
                <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Library
              </Button>
            </div>

            {/* Purchase Status Indicator */}
            {hasPurchased && (
              <Card className="bg-[#895B26]/10 border-[#895B26]/30 p-3 sm:p-4">
                <p className="text-[#895B26] text-xs sm:text-sm font-medium">
                  ✓ You own this album - All tracks are unlocked
                </p>
              </Card>
            )}

            {!hasPurchased && user && (
              <Card className="bg-destructive/10 border-destructive/30 p-3 sm:p-4">
                <p className="text-destructive text-xs sm:text-sm font-medium">
                  🔒 Purchase this album to unlock all tracks
                </p>
              </Card>
            )}

            {!user && (
              <Card className="bg-muted border-border p-3 sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  ℹ️ Log in to purchase and access full tracks
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Track List */}
        <Card className="bg-card border-border p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Tracklist</h2>
          <div className="space-y-2">
            {songs.map((track) => {
              const isLocked = !hasPurchased && !track.is_preview;
              const isPlaying = currentlyPlaying === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all ${
                    isLocked
                      ? "bg-muted/50 cursor-not-allowed opacity-60"
                      : "bg-accent/50 hover:bg-accent cursor-pointer"
                  } ${isPlaying ? "bg-[#895B26]/20 ring-2 ring-[#895B26]" : ""}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <span className="text-muted-foreground w-6 sm:w-8 text-center text-sm">
                    {track.track_number}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 ${
                      isLocked
                        ? "bg-muted text-muted-foreground"
                        : isPlaying
                        ? "bg-[#895B26] hover:bg-[#895B26]/90 text-white"
                        : "bg-[#895B26] hover:bg-[#895B26]/90 text-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                  >
                    {isLocked ? (
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : isPlaying ? (
                      <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm sm:text-base truncate ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                      {track.title}
                    </p>
                    {track.is_preview && !hasPurchased && (
                      <span className="text-xs text-[#895B26]">(Preview)</span>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm flex-shrink-0 ${isLocked ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
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