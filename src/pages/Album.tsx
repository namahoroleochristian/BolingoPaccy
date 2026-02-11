import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, Music, ShoppingCart, Lock, Unlock, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
    audioRef.current.controls = false;
    
    // Security attributes
    audioRef.current.controlsList = "nodownload noplaybackrate nofullscreen";
    (audioRef.current as any).disablePictureInPicture = true;
    
    // Event listeners
    audioRef.current.addEventListener("loadedmetadata", handleAudioLoaded);
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("ended", handleAudioEnded);
    audioRef.current.addEventListener("error", handleAudioError);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

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
      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .eq("album_id", currentAlbum.id)
        .order("track_number");

      setSongs(songsData || []);

      if (user) {
        const { data: purchaseData } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_email", user.email)
          .eq("album_id", currentAlbum.id)
          .eq("status", "completed")
          .maybeSingle();

        const purchased = !!purchaseData;
        setHasPurchased(purchased);
        
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
    stopAudio();
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

  const handlePlayTrack = async (song: Song) => {
    if (!hasPurchased && !song.is_preview) {
      toast({
        title: "Purchase Required",
        description: "Buy the album to unlock all tracks.",
        variant: "destructive",
      });
      return;
    }

    // If clicking the same track, toggle play/pause
    if (currentlyPlaying === song.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        toast({
          title: "Paused",
          description: song.title,
        });
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error resuming audio:", error);
          handlePlaybackError(song);
        });
        setIsPlaying(true);
        toast({
          title: "Resumed",
          description: song.title,
        });
      }
      return;
    }

    // Stop any currently playing audio
    stopAudio();

    // Set new track as currently playing
    setCurrentlyPlaying(song.id);
    setIsPlaying(true);
    
    if (!song.audio_url) {
      toast({
        title: "Playback Error",
        description: "No audio URL found for this track.",
        variant: "destructive",
      });
      return;
    }

    if (audioRef.current) {
      try {
        // Clear previous source
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Set new source
        audioRef.current.src = song.audio_url;
        audioRef.current.volume = volume;
        
        // Play audio
        await audioRef.current.play();
        
        toast({
          title: "Now Playing",
          description: `${song.title}${hasPurchased ? ' (Full Version)' : ' (Preview)'}`,
        });
      } catch (error) {
        console.error("Audio play error:", error);
        handlePlaybackError(song);
      }
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    handleNextTrack();
  };

  const handleAudioError = (e: Event) => {
    console.error("Audio element error:", e);
    setIsPlaying(false);
    
    const currentSong = songs.find(s => s.id === currentlyPlaying);
    if (currentSong) {
      toast({
        title: "Playback Error",
        description: `Could not play "${currentSong.title}". Please check your internet connection.`,
        variant: "destructive",
      });
    }
  };

  const handlePlaybackError = (song: Song) => {
    setIsPlaying(false);
    toast({
      title: "Playback Error",
      description: `Could not play "${song.title}". Please try again.`,
      variant: "destructive",
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0])) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNextTrack = () => {
    if (!currentlyPlaying || songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentlyPlaying);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    if (!hasPurchased && !nextSong.is_preview) {
      toast({
        title: "Track Locked",
        description: "Purchase the album to unlock all tracks.",
        variant: "destructive",
      });
      return;
    }
    
    handlePlayTrack(nextSong);
  };

  const handlePreviousTrack = () => {
    if (!currentlyPlaying || songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentlyPlaying);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
    const prevSong = songs[prevIndex];
    
    if (!hasPurchased && !prevSong.is_preview) {
      toast({
        title: "Track Locked",
        description: "Purchase the album to unlock all tracks.",
        variant: "destructive",
      });
      return;
    }
    
    handlePlayTrack(prevSong);
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

  const currentSong = songs.find(song => song.id === currentlyPlaying);

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Floating Audio Player */}
        {currentlyPlaying && currentSong && (
          <Card className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-auto lg:bottom-8 lg:w-96 lg:left-1/2 lg:transform lg:-translate-x-1/2 bg-card border-2 border-[hsl(var(--primary))]/30 shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{currentSong.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentAlbum.title} • {hasPurchased ? 'Full Version' : 'Preview'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopAudio}
                >
                  ×
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-3">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePreviousTrack}
                    disabled={songs.length <= 1}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      if (currentSong) handlePlayTrack(currentSong);
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextTrack}
                    disabled={songs.length <= 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Audio streaming only. Downloads are disabled.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Rest of your UI remains the same... */}
        {albums.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousAlbum}
                className="border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
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
                className="border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumChange(album)}
                  className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    currentAlbum.id === album.id
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "bg-card border border-[hsl(var(--border))] text-foreground hover:bg-[hsl(var(--accent))]"
                  }`}
                >
                  {album.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <Card className="overflow-hidden bg-card border-[hsl(var(--border))]">
            <img
              src={currentAlbum.cover_url || albumCover}
              alt={currentAlbum.title}
              className="w-full aspect-square object-cover"
            />
          </Card>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
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
                  className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] font-semibold"
                  disabled
                >
                  <Unlock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Album Owned
                </Button>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] font-semibold"
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Buy Now
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
              >
                <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Library
              </Button>
            </div>

            {hasPurchased && (
              <Card className="bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]/30 p-3 sm:p-4">
                <p className="text-[hsl(var(--primary))] text-xs sm:text-sm font-medium">
                  ✓ You own this album - All tracks are unlocked
                </p>
              </Card>
            )}

            {!hasPurchased && user && (
              <Card className="bg-[hsl(var(--primary))]/10 border-[hsl(var(--destructive))]/30 p-3 sm:p-4">
                <p className="text-[hsl(var(--primary-background))] text-xs sm:text-sm font-medium">
                  🔒 Purchase this album to unlock all tracks
                </p>
              </Card>
            )}

            {!user && (
              <Card className="bg-muted border-[hsl(var(--border))] p-3 sm:p-4">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  ℹ️ Log in to purchase and access full tracks
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Track List */}
        <Card className="bg-card border-[hsl(var(--border))] p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Tracklist</h2>
          <div className="space-y-2">
            {songs.map((track) => {
              const isLocked = !hasPurchased && !track.is_preview;
              const isTrackPlaying = currentlyPlaying === track.id;

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all ${
                    isLocked
                      ? "bg-muted/50 cursor-not-allowed opacity-60"
                      : "bg-[hsl(var(--accent))]/50 hover:bg-[hsl(var(--accent))] cursor-pointer"
                  } ${isTrackPlaying ? "bg-[hsl(var(--primary))]/20 ring-2 ring-[hsl(var(--primary))]" : ""}`}
                  onClick={() => !isLocked && handlePlayTrack(track)}
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
                        : isTrackPlaying && isPlaying
                        ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
                        : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) handlePlayTrack(track);
                    }}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : isTrackPlaying && isPlaying ? (
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
                      <span className="text-xs text-[hsl(var(--primary))]">(Preview)</span>
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