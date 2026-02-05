import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Song {
  id: string;
  title: string;
  price: number;
  type: string;
}

const Songs = () => {
  const navigate = useNavigate();
  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').eq('type', 'song');
      if (error) throw error;
      return data as Song[];
    },
  });

  const addToCart = (song: Song) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = [...currentCart, { id: song.id, title: song.title, price: song.price }];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${song.title} added to cart`);
    navigate('/checkout');
  };

  if (isLoading) return <div className="container mx-auto px-4 py-12">Loading songs...</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Songs</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Explore and purchase tracks from the collection
        </p>

        <div className="space-y-4">
          {songs?.map((song, index) => (
            <Card
              key={song.id}
              className="bg-card border-border hover:border-primary transition-all animate-slide-up p-6 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {song.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-primary">${song.price}</span>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => addToCart(song)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Songs;
