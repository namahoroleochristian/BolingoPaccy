import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import albumCover from "@/assets/AlbumCover.jpeg";
import { Play, Music } from "lucide-react";

const Album = () => {
  const tracks = [
    { number: 1, title: "Inyenyeri", duration: "4:32" },
    { number: 2, title: "Umucancuro", duration: "3:45" },
    { number: 3, title: "Inzozi", duration: "5:12" },
    { number: 4, title: "Urukundo", duration: "4:18" },
    { number: 5, title: "Ubumuntu", duration: "3:56" },
    { number: 6, title: "Amahoro", duration: "4:43" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Album Cover */}
          <div className="animate-slide-in">
            <Card className="bg-card border-border overflow-hidden">
              <img
                src={albumCover}
                alt="Inyenyeri Album"
                className="w-full h-auto"
              />
            </Card>
          </div>

          {/* Album Info */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <p className="text-primary text-sm uppercase tracking-wider mb-2">Album</p>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4">Inyenyeri</h1>
              <p className="text-xl text-muted-foreground">by Bolingo Paccy</p>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <p><span className="text-foreground font-semibold">Released:</span> 2024</p>
              <p><span className="text-foreground font-semibold">Genre:</span> Afro-fusion, Traditional</p>
              <p><span className="text-foreground font-semibold">Duration:</span> 26:26</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Inyenyeri (The Stars) is a masterful blend of traditional African rhythms 
              and contemporary soundscapes. Each track tells a story of heritage, love, 
              and the human experience, woven together with the distinctive sound of 
              the umucancuro instrument.
            </p>

            <div className="flex gap-4 pt-4">
              <Button size="lg" className="bg-[#895B26] hover:bg-primary/90 gap-2">
                <Play className="h-5 w-5" />
                Play Album
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Music className="h-5 w-5" />
                Add to Library
              </Button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold mb-6">Tracklist</h2>
          {tracks.map((track, index) => (
            <Card
              key={track.number}
              className="bg-card border-border hover:border-primary transition-all p-4 group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground w-8">{track.number}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <span className="flex-1 font-medium group-hover:text-primary transition-colors">
                  {track.title}
                </span>
                <span className="text-muted-foreground">{track.duration}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Album;
