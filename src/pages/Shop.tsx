import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: number;
  type: string;
  thumbnail_path?: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useQuery({
    queryKey: ['shop-media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*');
      if (error) throw error;
      return data as Product[];
    },
  });

  const addToCart = (product: Product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = [...currentCart, { id: product.id, title: product.title, price: product.price }];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${product.title} added to cart`);
    navigate('/checkout');
  };

  if (isLoading) return <div className="container mx-auto px-4 py-12">Loading shop...</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Shop</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Official merchandise and music
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product, index) => (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                {product.thumbnail_path ? (
                  <img
                    src={product.thumbnail_path}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-muted-foreground capitalize">{product.type}</span>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">High-quality digital {product.type}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">${product.price}</span>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => addToCart(product)}
                  >
                    Buy Now
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

export default Shop;
