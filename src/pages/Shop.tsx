import { Card } from "@/components/ui/card";

const Shop = () => {
  const images = [
    {
      id: 1,
      title: "Inyenyeri Album Cover",
      image: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=400",
    },
    {
      id: 2,
      title: "Vinyl Collection",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400",
    },
    {
      id: 3,
      title: "Concert Merchandise",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    },
    {
      id: 4,
      title: "Album Artwork",
      image: "https://images.unsplash.com/photo-1611329532992-0b18c469ff5a?w=400",
    },
    {
      id: 5,
      title: "Studio Session",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    },
    {
      id: 6,
      title: "Live Performance",
      image: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400",
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Gallery</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Moments captured through the lens
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, index) => (
            <Card
              key={item.id}
              className="bg-card border-border overflow-hidden group animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                  <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                  </div>
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