import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

const Tour = () => {
  const shows = [
    {
      id: 1,
      date: "March 15, 2025",
      venue: "Kigali Arena",
      city: "Kigali, Rwanda",
      status: "tickets",
    },
    {
      id: 2,
      date: "March 22, 2025",
      venue: "National Theatre",
      city: "Kampala, Uganda",
      status: "tickets",
    },
    {
      id: 3,
      date: "April 5, 2025",
      venue: "Carnivore Grounds",
      city: "Nairobi, Kenya",
      status: "tickets",
    },
    {
      id: 4,
      date: "April 12, 2025",
      venue: "Dar es Salaam Arena",
      city: "Dar es Salaam, Tanzania",
      status: "soldout",
    },
    {
      id: 5,
      date: "April 26, 2025",
      venue: "Alliance Française",
      city: "Addis Ababa, Ethiopia",
      status: "tickets",
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in text-foreground">Tour Dates</h1>
        <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
          Join us live for an unforgettable musical experience
        </p>

        <div className="space-y-4">
          {shows.map((show, index) => (
            <Card
              key={show.id}
              className="bg-card border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">{show.date}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">{show.venue}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{show.city}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className={
                    show.status === "soldout"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
                  }
                  disabled={show.status === "soldout"}
                >
                  {show.status === "soldout" ? "Sold Out" : "Get Tickets"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-card border-[hsl(var(--primary))]/50 p-8 animate-fade-in text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Sign up to receive notifications about new tour dates and exclusive presale access
          </p>
          <Button 
            size="lg" 
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))]"
          >
            Subscribe to Newsletter
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Tour;