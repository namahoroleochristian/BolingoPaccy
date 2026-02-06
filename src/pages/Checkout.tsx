import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import Layout from "@/components/Layout";
import { Loader2, ShoppingCart, Lock } from "lucide-react";
import albumCover from "@/assets/AlbumCover.jpeg";

const emailSchema = z.string().email("Please enter a valid email address");

interface Album {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  cover_url: string | null;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const albumId = searchParams.get("album");
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingAlbum, setFetchingAlbum] = useState(true);
  const [emailError, setEmailError] = useState("");
  
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!albumId) {
        setFetchingAlbum(false);
        return;
      }

      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching album:", error);
        toast({
          title: "Error",
          description: "Failed to load album details.",
          variant: "destructive",
        });
      }

      setAlbum(data);
      setFetchingAlbum(false);
    };

    fetchAlbum();
  }, [albumId, toast]);

  useEffect(() => {
    // Pre-fill email if user is logged in
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      emailSchema.parse(email);
      setEmailError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
        return;
      }
    }

    if (!album) {
      toast({
        title: "Error",
        description: "No album selected.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const callbackUrl = `${window.location.origin}/payment-callback`;
      
      const response = await supabase.functions.invoke("create-order", {
        body: {
          album_id: album.id,
          customer_email: email,
          customer_first_name: firstName || undefined,
          customer_last_name: lastName || undefined,
          callback_url: callbackUrl,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { redirect_url, merchant_reference } = response.data;

      if (!redirect_url) {
        throw new Error("No payment redirect URL received");
      }

      // Store merchant reference for callback verification
      localStorage.setItem("pending_order_ref", merchant_reference);

      // Redirect to Pesapal payment page
      window.location.href = redirect_url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (fetchingAlbum) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!album) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Album Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The album you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#895B26]">
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Checkout
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <img
                  src={album.cover_url || albumCover}
                  alt={album.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{album.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {album.description}
                  </p>
                  <p className="text-xl font-bold text-[#895B26]">
                    {album.currency} {album.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#895B26]">
                    {album.currency} {album.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Checkout Form */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-6">Your Details</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your purchase confirmation will be sent here
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#895B26] hover:bg-[#895B26]/90 h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Pay {album.currency} {album.price.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  You'll be redirected to Pesapal to complete your payment securely.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
