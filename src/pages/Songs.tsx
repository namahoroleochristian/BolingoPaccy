import { Card } from "@/components/ui/card";

interface Song {
  id: string;
  title: string;
  youtube_url?: string;
  spotify_url?: string;
}

const albumSongs: Song[] = [
  {
    id: "1",
    title: "BUSHYA FT OKKAMA",
    youtube_url: "https://www.youtube.com/embed/Wu8UsgF5xXM",
  },
  {
    id: "2",
    title: "SINICUZA FT KING JAMES",
    youtube_url: "https://www.youtube.com/embed/rLsrUoEX3oI",
  },
  {
    id: "4",
    title: "Umucancuro",
    spotify_url: "https://open.spotify.com/embed/track/6h3RMfsYOEmg8nYZuITB27?theme=0",
  },
  {
    id: "3",
    title: "Ese Urihe",
    youtube_url: "https://www.youtube.com/embed/u02A6fov_kI",
  },
  {
    id: "5",
    title: "Ihogoza ft Mani Martin",
    spotify_url: "https://open.spotify.com/embed/track/3LLyDdulzaT8U577Z3DsOD",
  },
  {
    id: "7",
    title: "Kabyino ka nyogokuru ",
    spotify_url: "https://open.spotify.com/embed/track/4m2YB6kRDxo23HIoXWwcxt?theme=0",
  },
  {
    id: "6",
    title: "Umuntu",
    spotify_url: "https://open.spotify.com/embed/track/3oFMfWkGHBTDSOJO0mmFVl?theme=0",
  },
  {
    id: "8",
    title: "Biranyura",
    youtube_url: "https://www.youtube.com/embed/Rv0Z3gXU-Mo",
  },
];

const Songs = () => {
  return (
    <div className="container mx-auto px-4 py-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-foreground">Songs</h1>
          <p className="text-muted-foreground text-lg">
            Listen to the complete Inyenyeri Album
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albumSongs.map((song) => (
            <Card
              key={song.id}
              className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* YouTube iframe */}
              {song.youtube_url && (
                <div className="aspect-video">
                  <iframe
                    src={song.youtube_url}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`YouTube - ${song.title}`}
                  />
                </div>
              )}
              
              {/* Spotify iframe (only if no YouTube) */}
              {!song.youtube_url && song.spotify_url && (
                <div className="h-24">
                  <iframe className="min-h-full "  src={song.spotify_url} width="100%" height="330" frameBorder="0"  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
              )}

              {/* Song title */}
                  {song.youtube_url && (
              <div className="p-4 text-center">

                    <h3 className="font-bold text-lg text-foreground truncate">
                      {song.title}
                </h3>
              </div>
                  )                           
}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Songs;