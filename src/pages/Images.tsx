import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Instagram, Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  type: "image" | "instagram";
  instagramUrl?: string;
}

const Images = () => {
  // Placeholder images - these can be replaced with actual data from database
  const [images] = useState<GalleryImage[]>([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
      title: "Live Performance",
      type: "image",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
      title: "Concert Night",
      type: "instagram",
      instagramUrl: "https://instagram.com/bolingopaccy",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600",
      title: "Studio Session",
      type: "image",
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
      title: "Festival Vibes",
      type: "instagram",
      instagramUrl: "https://instagram.com/bolingopaccy",
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600",
      title: "Behind the Scenes",
      type: "image",
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
      title: "Music Video Shoot",
      type: "instagram",
      instagramUrl: "https://instagram.com/bolingopaccy",
    },
  ]);

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">Gallery</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Photos, moments, and behind-the-scenes glimpses
        </p>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {images.map((image, index) => (
            <Card
              key={image.id}
              className="bg-card border-border overflow-hidden group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(image)}
            >
              <AspectRatio ratio={1}>
                <div className="relative w-full h-full">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">{image.title}</span>
                      {image.type === "instagram" ? (
                        <Instagram className="h-5 w-5 text-white" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Instagram Badge */}
                  {image.type === "instagram" && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1.5 rounded-lg">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </AspectRatio>
            </Card>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {selectedImage.type === "instagram" ? "Instagram Post" : "Photo"}
                    </p>
                  </div>
                  {selectedImage.instagramUrl && (
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <a href={selectedImage.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Instagram CTA */}
        <div className="mt-16 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-primary/20 p-8">
            <Instagram className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Follow on Instagram</h3>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest photos, stories, and behind-the-scenes content
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90">
              <a href="https://instagram.com/bolingopaccy" target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-5 w-5" />
                @bolingopaccy
              </a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Images;
