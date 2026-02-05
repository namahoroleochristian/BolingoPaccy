import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const products = [
    {
      id: 1,
      name: "Inyenyeri Album - Digital",
      price: "$9.99",
      description: "High-quality digital download",
      image: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=400",
    },
    {
      id: 2,
      name: "Inyenyeri Album - Vinyl",
      price: "$34.99",
      description: "Limited edition vinyl record",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400",
    },
    {
      id: 3,
      name: "Concert T-Shirt",
      price: "$24.99",
      description: "Official tour merchandise",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    },
    {
      id: 4,
      name: "Signed Poster",
      price: "$19.99",
      description: "Autographed album artwork",
      image: "https://images.unsplash.com/photo-1611329532992-0b18c469ff5a?w=400",
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Shop</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Official merchandise and music
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{product.price}</span>
                  <Button className="bg-primary hover:bg-primary/90">
                    Add to Cart
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
