import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import albumCover from "@/assets/AlbumCover.jpeg";

interface Album {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  cover_url: string | null;
}

const Albums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const { data, error } = await supabase
          .from("albums")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAlbums(data || []);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">Albums</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4" />
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
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Albums</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Explore the complete discography
        </p>

        {albums.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No albums available yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album, index) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="bg-card border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={album.cover_url || albumCover}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-white text-sm font-medium">View Album →</span>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-2">
                    <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                      {album.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Bolingo Paccy</span>
                      <span className="text-primary font-bold text-lg">
                        {album.currency} {album.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;
