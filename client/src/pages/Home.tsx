import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 lg:px-8 py-12">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Album Cover */}
          <div className="animate-slide-in">
            <div className="relative max-w-xl mx-auto">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 text-sm tracking-[0.3em] rotate-180" style={{ writingMode: "vertical-rl" }}>
                <span className="text-foreground/60">ALBUM</span>
              </div>
              
              <div className="relative bg-card rounded-lg overflow-hidden shadow-2xl">
                <div className="p-6 lg:p-8 bg-[black]">
                 
                  
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

            <Button 
              size="lg"
              className="bg-[#895B26] hover:bg-[#895B26] text-primary-foreground px-8 lg:px-12 py-6 text-base lg:text-lg font-semibold rounded-lg transition duration-300 hover:scale-105"
            >
              BUY NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
