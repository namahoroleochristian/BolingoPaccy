// pages/PremiumContent.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Video, AlertCircle, XCircle, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Your YouTube unlisted video IDs (keep these secret)
const PREMIUM_VIDEOS = [
  {
    id: import.meta.env.VITE_PREMIUM_VIDEO_1_ID || "",
    title: import.meta.env.VITE_PREMIUM_VIDEO_1_TITLE || "Premium Show #1"
  },
  {
    id: import.meta.env.VITE_PREMIUM_VIDEO_2_ID || "",
    title: import.meta.env.VITE_PREMIUM_VIDEO_2_TITLE || "Premium Show #2"
  },
  {
    id: import.meta.env.VITE_PREMIUM_VIDEO_3_ID || "",
    title: import.meta.env.VITE_PREMIUM_VIDEO_3_TITLE || "Premium Show #3"
  },
].filter(video => video.id); 

// Premium album ID for access check
const PREMIUM_ALBUM_ID = "e19079e7-4f19-4dee-873f-3fc17a4ee914";

const PremiumContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  // Enhanced security: Disable right-click, keyboard shortcuts, etc.
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Multiple right-click attempts detected.",
            variant: "destructive",
          });
        }
        return newAttempts;
      });
      return false;
    };

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }
    };

    const disablePrintScreen = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast({
          title: "Screenshot Blocked",
          description: "Screenshots are disabled on premium content.",
          variant: "destructive",
        });
        return false;
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeyboardShortcuts);
    document.addEventListener("keydown", disablePrintScreen);
    
    // Prevent text selection
    document.addEventListener("selectstart", preventDefault);
    document.addEventListener("dragstart", preventDefault);

    // Blur on tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast({
          title: "Tab Switch Detected",
          description: "Premium content paused due to tab switch.",
          variant: "destructive",
        });
        // Force iframe reload on return
        setIframeKey(Date.now());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Prevent leaving page with warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your premium access is logged.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Check premium access
    const checkPremiumAccess = async () => {
      if (!user) {
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "Please log in to access premium content.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        const { data: purchaseData, error } = await supabase
          .from("orders")
          .select("id, status, created_at")
          .eq("customer_email", user.email)
          .eq("album_id", PREMIUM_ALBUM_ID)
          .eq("status", "completed")
          .maybeSingle();

        if (error) {
          console.error("Error checking premium access:", error);
          setHasAccess(false);
          toast({
            title: "Error",
            description: "Unable to verify your access. Please try again.",
            variant: "destructive",
          });
          navigate("/album");
        } else if (!purchaseData) {
          setHasAccess(false);
          toast({
            title: "Access Denied",
            description: "You need to purchase the premium album to access this content.",
            variant: "destructive",
          });
          navigate("/album");
        } else {
          setHasAccess(true);
          
          // Log the access (optional for tracking)
          await supabase.from("premium_access_logs").insert({
            user_email: user.email,
            album_id: PREMIUM_ALBUM_ID,
            accessed_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setHasAccess(false);
        navigate("/album");
      } finally {
        setLoading(false);
      }
    };

    checkPremiumAccess();

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeyboardShortcuts);
      document.removeEventListener("keydown", disablePrintScreen);
      document.removeEventListener("selectstart", preventDefault);
      document.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, navigate, toast]);

  // Add watermark overlay
  useEffect(() => {
    const addWatermark = () => {
      const watermark = document.createElement("div");
      watermark.id = "premium-watermark";
      watermark.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          // background: repeating-linear-gradient(
          //   45deg,
          //   transparent,
          //   transparent 20px,
          //   rgba(255, 0, 0, 0.05) 20px,
          //   rgba(255, 0, 0, 0.05) 40px
          // );
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 40px;
            color: rgba(255, 0, 0, 0.0);
            white-space: nowrap;
            font-weight: bold;
          ">
            ${user?.email || "PREMIUM CONTENT"} • ${new Date().toISOString().split('T')[0]}
          </div>
        </div>
      `;
      document.body.appendChild(watermark);
    };

    if (hasAccess) {
      addWatermark();
    }

    return () => {
      const watermark = document.getElementById("premium-watermark");
      if (watermark) {
        document.body.removeChild(watermark);
      }
    };
  }, [hasAccess, user]);

  const handleVideoChange = (index: number) => {
    setCurrentVideo(index);
    setIframeKey(Date.now()); // Force iframe reload
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto"></div>
          <p className="text-foreground">Verifying premium access...</p>
          <p className="text-sm text-muted-foreground">Security check in progress</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Already redirected
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Security Warning Banner */}
      {/* <div className="max-w-6xl mx-auto mb-6">
        <Card className="bg-destructive/10 border-destructive/30 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                SECURITY NOTICE: This content is protected
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                Unauthorized recording, sharing, or distribution is prohibited and may result in account termination.
                All access is logged and monitored.
              </p>
            </div>
          </div>
        </Card>
      </div> */}

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* <Lock className="h-6 w-6 text-[hsl(var(--primary))]" /> */}
            <h1 className="text-3xl font-bold text-foreground">Premium Content</h1>
          </div>
          <p className="text-muted-foreground">
            {/* Exclusive unlisted shows for premium members only */}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            {/* <EyeOff className="h-3 w-3" /> */}
            {/* <span>Logged in as: {user?.email}</span> */}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-[hsl(var(--border))] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h2 className="text-xl font-semibold text-foreground">Premium Shows</h2>
              </div>
              
              <div className="space-y-3">
                {PREMIUM_VIDEOS.map((video, index) => (
                  <Button
                    key={video.id}
                    variant={currentVideo === index ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      currentVideo === index
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
                    }`}
                    onClick={() => handleVideoChange(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        currentVideo === index
                          ? "bg-[hsl(var(--primary-foreground))]/20"
                          : "bg-muted"
                      }`}>
                        <span className="text-xs font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available only to Gold package
                        </p>
                      </div>
                      {currentVideo === index && (
                        <div className="animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary-foreground))]" />
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">All access is logged</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Screenshots disabled</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-4">
                    <p>Attempted security bypass: {attempts} time(s)</p>
                  </div>
                </div>
              </div> */}
            </Card>
          </div>

          {/* Main Video Player */}
<div className="lg:col-span-2">
  <Card className="bg-black border-[hsl(var(--border))] overflow-hidden">
    {/* Security Frame */}
    <div className="relative pt-[56.25%] bg-black">
      {/* YouTube iframe with enhanced privacy settings */}
      <iframe
        key={iframeKey}
        src={`https://www.youtube-nocookie.com/embed/${PREMIUM_VIDEOS[currentVideo].id}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=1`}
        title={PREMIUM_VIDEOS[currentVideo].title}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms disable-clipboard-write"
      />
      
      {/* Security Overlay - Prevents user interaction with iframe */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
        id="security-overlay"
      >
        {/* Invisible interaction blocker - covers entire iframe */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-transparent"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setAttempts(prev => prev + 1);
            toast({
              title: "Interaction Blocked",
              description: "Right-click is disabled on premium content.",
              variant: "destructive",
            });
          }}
          style={{
            pointerEvents: 'auto',
            cursor: 'default',
            zIndex: 10
          }}
        />
        
        {/* Additional security overlay elements */}
        {/* <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
          <span className="blur-[1px] select-none">BP:{user?.email?.substring(0, 5)}</span>
        </div> */}
        
        {/* Watermark overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 20px,
              rgba(255, 255, 255, 0.02) 20px,
              rgba(255, 255, 255, 0.02) 40px
            )`,
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Corner guards to prevent iframe inspection */}
        <div className="absolute top-0 left-0 w-20 h-20 pointer-events-auto z-30" 
             onClick={(e) => e.stopPropagation()}
             onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-auto z-30"
             onClick={(e) => e.stopPropagation()}
             onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-auto z-30"
             onClick={(e) => e.stopPropagation()}
             onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-auto z-30"
             onClick={(e) => e.stopPropagation()}
             onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>

    <div className="p-6 bg-card">
      <h3 className="text-xl font-bold text-foreground mb-2">
        {PREMIUM_VIDEOS[currentVideo].title}
      </h3>
      <p className="text-muted-foreground">
        ENJOY YOUR PREEMIUM PACKAGE
        <br />
        {/* <span className="text-destructive text-sm font-medium">
          Note: Direct interaction with the video player is blocked for security reasons.
        </span> */}
      </p>
      
      {/* <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Protected by:
          </span>
          <span className="px-2 py-1 bg-muted rounded text-xs">
            🔒 No-embed
          </span>
          <span className="px-2 py-1 bg-muted rounded text-xs">
            🛡️ Overlay Shield
          </span>
          <span className="px-2 py-1 bg-muted rounded text-xs">
            🚫 Interaction Block
          </span>
          <span className="px-2 py-1 bg-muted rounded text-xs">
            👁️ Unlisted
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIframeKey(Date.now())}
          className="border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
        >
          Refresh Player
        </Button>
      </div> */}
    </div>
  </Card>

  {/* Additional Security Info */}
  {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="bg-card border-[hsl(var(--border))] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
          <span className="text-blue-500 text-sm">🔒</span>
        </div>
        <h4 className="font-medium text-foreground">Interaction Block</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        A transparent overlay prevents direct interaction with the video player.
      </p>
    </Card>

    <Card className="bg-card border-[hsl(var(--border))] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-500 text-sm">📸</span>
        </div>
        <h4 className="font-medium text-foreground">Screenshot Protection</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Multiple layers prevent screenshots and screen recording.
      </p>
    </Card>

    <Card className="bg-card border-[hsl(var(--border))] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
          <span className="text-green-500 text-sm">🛡️</span>
        </div>
        <h4 className="font-medium text-foreground">Overlay Protection</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Security overlay blocks right-click, inspect element, and iframe interaction.
      </p>
    </Card>
  </div> */}
</div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 pt-8 border-t border-[hsl(var(--border))]">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} BOLINGO Paccy. All rights reserved.
              <br />
              Unauthorized distribution of this premium content is strictly prohibited.
              Violators will be prosecuted to the fullest extent of the law.
            </p>
            <p className="text-xs text-destructive mt-2">
              {/* Access logged at: {new Date().toLocaleString()} | Session ID: {Math.random().toString(36).substr(2, 9)} */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumContent;