import { Card } from "@/components/ui/card";

const Shop = () => {
  const images = [
    {
      id: 1,
      title: "Bolingo",
      image:  new URL("../assets/Bolingo.jpeg", import.meta.url).href,
    },
    {
      id: 2,
      title: "Imizi Guitar",
      image:  new URL("../assets/Bolingo (2).jpeg", import.meta.url).href,
    },
    {
      id: 3,
      title: "Album Artwork",
      image: new URL("../assets/Bolingo (4).jpeg", import.meta.url).href,
    },
    {
      id: 4,
      title: "Studio Session",
      image: new URL("../assets/Bolingo (5).jpeg", import.meta.url).href,
    },
    {
      id: 5,
      title: "Live Performance",
      image: new URL("../assets/Bolingo (8).jpeg", import.meta.url).href,
    },
    {
      id: 6,
      title: "Live Performance",
      image: new URL("../assets/Bolingo (6).jpeg", import.meta.url).href,
    },
    {
      id: 7,
      title: "Concert Merchandise",
      image: new URL("../assets/Bolingo (3).jpeg", import.meta.url).href,
    },
    {
      id: 8,
      title: "RTV Versus",
      image: new URL("../assets/Bolingo (7).jpeg", import.meta.url).href,
    },
    {
      id: 9,
      title: "Bushya Music premier",
      image: new URL("../assets/Bolingo (9).jpeg", import.meta.url).href,
    },
   
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        {/* <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Gallery</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Moments captured through the lens
        </p> */}

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