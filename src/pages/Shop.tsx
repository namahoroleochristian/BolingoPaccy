import { Card } from "@/components/ui/card";
import Img1 from '../assets/Bolingo-6.png';
import Img2 from '../assets/Bolingo-9.png';
import Img3 from '../assets/Bolingo-2.png';
import Img4 from '../assets/Bolingo-1.png';
import Img5 from '../assets/Bolingo-9.png';
import Img6 from '../assets/Bolingo-7.png';
import Img7 from '../assets/Bolingo-3.png';
import Img8 from '../assets/Bolingo-4.png';
import Img9 from '../assets/Bolingo-5.png';

const Shop = () => {
  const images = [
    {
      id: 1,
      title: "Bolingo",
      image:  Img9,
    },
    {
      id: 2,
      title: "Imizi Guitar",
      image:  Img8,
    },
    {
      id: 3,
      title: "Album Artwork",
      image: Img7,
    },
    {
      id: 4,
      title: "Studio Session",
      image: Img6,
    },
    {
      id: 5,
      title: "Live Performance",
      image: Img3,
    },
    {
      id: 6,
      title: "Live Performance",
      image: Img5,
    },
    {
      id: 7,
      title: "Concert Merchandise",
      image: Img4,
    },
    {
      id: 8,
      title: "RTV Versus",
      image: Img2,
    },
    {
      id: 9,
      title: "Bushya Music premier",
      image: Img1,
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, index) => (
            <Card
              key={index}
              className="bg-card border-[hsl(var(--border))] overflow-hidden group animate-slide-up cursor-pointer"
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