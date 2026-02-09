import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import albumCover from "@/assets/AlbumCover.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Album {
  id: string;
  title: string;
  price: number;
  currency: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      const { data } = await supabase
        .from("albums")
        .select("id, title, price, currency")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      
      setAlbum(data);
    };
    fetchAlbum();
  }, []);

  const handleBuyNow = () => {
    if (album) {
      if (!user) {
        navigate("/auth");
        return;
      }
      navigate(`/checkout?album=${album.id}`);
    } else {
      navigate("/album");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 lg:px-8 py-12 bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Album Cover */}
          <div className="animate-slide-in">
            <div className="relative max-w-xl mx-auto">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 text-sm tracking-[0.3em] rotate-180" style={{ writingMode: "vertical-rl" }}>
                <span className="text-foreground/60">ALBUM</span>
              </div>
              
              <div className="relative bg-card rounded-lg overflow-hidden shadow-2xl">
                <div className="p-6 lg:p-8 bg-card">
                  <img
                    src={albumCover}
                    alt="Umucancuro Album Cover"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Album Info */}
          <div className="animate-fade-in space-y-6 lg:space-y-8">
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground">
              UMUCANCURO ALBUM
            </h1>
            
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Experience the soul-stirring melodies of traditional African music reimagined. 
              Inyenyeri (The Stars) takes you on a journey through rich cultural heritage 
              and contemporary soundscapes.
            </p>

            {album && (
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {album.currency} {album.price.toFixed(2)}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] px-8 lg:px-12 py-6 text-base lg:text-lg font-semibold rounded-lg transition duration-300 hover:scale-105"
                onClick={handleBuyNow}
              >
                BUY NOW
              </Button>
              
              {!user && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base lg:text-lg border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-foreground"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;