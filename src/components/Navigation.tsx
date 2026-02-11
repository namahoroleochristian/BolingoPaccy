// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { Menu, X, User, LogOut, LogIn } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";

// const Navigation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, signOut } = useAuth();
//   const { toast } = useToast();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navItems = [
//     { path: "/", label: "Home" },
//     { path: "/album", label: "Album" },
//     { path: "/gallery", label: "Gallery" },
//     { path: "/songs", label: "Songs" },
//     { path: "/tour", label: "Tour" },
//   ];

//   const isActive = (path: string) => location.pathname === path;

//   const handleSignOut = async () => {
//     const { error } = await signOut();
//     setMobileMenuOpen(false);
    
//     if (error) {
//       toast({
//         title: "Error",
//         description: "Failed to sign out. Please try again.",
//         variant: "destructive",
//       });
//     } else {
//       toast({
//         title: "Signed out",
//         description: "You have been successfully signed out.",
//       });
//       navigate("/");
//     }
//   };

//   const handleSignIn = () => {
//     setMobileMenuOpen(false);
//     navigate("/login");
//   };

//   return (
//     <>
//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-transparent border flex-col items-center justify-between py-8 z-50">
//         <Link to="/" className="text-2xl font-bold text-foreground hover:text-[hsl(var(--primary))] transition-colors">
//           BP
//         </Link>
        
//         <div className="flex flex-col gap-8 items-center rotate-180" style={{ writingMode: "vertical-rl" }}>
//           <Link 
//             to="/" 
//             className="text-sm tracking-wider text-foreground hover:text-[hsl(var(--primary))] transition-colors"
//           >
//             BOLINGO Paccy
//           </Link>
//         </div>

//         <div className="flex flex-col gap-4">
//           {[0, 1, 2, 3].map((index) => (
//             <div
//               key={index}
//               className={`w-3 h-3 rounded-full transition-all ${
//                 index === 0 ? "bg-[hsl(var(--primary))]" : "bg-muted"
//               }`}
//             />
//           ))}
//         </div>
//       </aside>

//       {/* Top Navigation */}
//       <nav className="fixed top-0 left-0 lg:left-24 right-0 z-40 bg-transparent backdrop-blur-sm pt-4">
//         <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
//           {/* Mobile Logo */}
//           <Link to="/" className="lg:hidden text-xl font-bold text-foreground">
//             BP
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex items-center gap-8 ml-8">
//             <Link to="/" className="text-foreground/70 hover:text-[hsl(var(--primary))] transition-colors tracking-wide">
//               BOLINGO Paccy
//             </Link>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden bg-transparent lg:flex items-center gap-8">
//             {navItems.slice(1).map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`text-BP uppercase tracking-wider transition-colors ${
//                   isActive(item.path)
//                     ? "text-[hsl(var(--primary))]"
//                     : "text-foreground hover:text-[hsl(var(--primary))]"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             ))}

//             {/* Desktop Profile Icon with Hover Overlay */}
//             <div 
//               className="relative group"
//             >
//               <button className="p-2 rounded-full hover:bg-[hsl(var(--accent))] transition-colors">
//                 <User className="h-5 w-5 text-foreground" />
//               </button>

//               {/* Profile Overlay Menu */}
//               <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
//                 <div className="bg-card border border-[hsl(var(--border))] rounded-lg shadow-lg overflow-hidden">
//                   {user ? (
//                     <>
//                       <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-muted/50">
//                         <p className="text-sm font-medium text-foreground">
//                           {user.user_metadata?.first_name || user.email?.split('@')[0]}
//                         </p>
//                         <p className="text-xs text-muted-foreground truncate">
//                           {user.email}
//                         </p>
//                       </div>
//                       <button
//                         onClick={handleSignOut}
//                         className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] transition-colors text-foreground"
//                       >
//                         <LogOut className="h-4 w-4" />
//                         Sign Out
//                       </button>
//                     </>
//                   ) : (
//                     <button
//                       onClick={handleSignIn}
//                       className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] transition-colors text-foreground"
//                     >
//                       <LogIn className="h-4 w-4" />
//                       Sign In
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="lg:hidden text-foreground"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden bg-card animate-fade-in">
//             <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`text-sm uppercase tracking-wider transition-colors ${
//                     isActive(item.path)
//                       ? "text-[hsl(var(--primary))]"
//                       : "text-foreground hover:text-[hsl(var(--primary))]"
//                   }`}
//                 >
//                   {item.label}
//                 </Link>
//               ))}

//               {/* Mobile Profile Section */}
//               <div className="border-t border-[hsl(var(--border))] pt-4 mt-2">
//                 {user ? (
//                   <>
//                     <div className="px-3 py-2 mb-2 bg-muted/50 rounded-lg">
//                       <p className="text-sm font-medium text-foreground">
//                         {user.user_metadata?.first_name || user.email?.split('@')[0]}
//                       </p>
//                       <p className="text-xs text-muted-foreground truncate">
//                         {user.email}
//                       </p>
//                     </div>
//                     <button
//                       onClick={handleSignOut}
//                       className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-foreground"
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Sign Out
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleSignIn}
//                     className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-foreground"
//                   >
//                     <LogIn className="h-4 w-4" />
//                     Sign In
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>
//     </>
//   );
// };

// export default Navigation;


import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, LogIn, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loadingPremiumCheck, setLoadingPremiumCheck] = useState(false);
  
  // Specify your premium album ID here
  const PREMIUM_ALBUM_ID = "e19079e7-4f19-4dee-873f-3fc17a4ee914"; // Replace with your actual album ID

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/album", label: "Album" },
    { path: "/gallery", label: "Gallery" },
    { path: "/songs", label: "Songs" },
    { path: "/events", label: "Events" },
  ];

  // Add premium link if user has purchased the specific album
  const premiumNavItem = { path: "/premium-content", label: "Premium" };
  
  const isActive = (path: string) => location.pathname === path;

  // Check if user has purchased the premium album
  useEffect(() => {
    const checkPremiumAccess = async () => {
      if (!user) {
        setHasPremiumAccess(false);
        setLoadingPremiumCheck(false);
        return;
      }

      setLoadingPremiumCheck(true);
      try {
        const { data: purchaseData, error } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_email", user.email)
          .eq("album_id", PREMIUM_ALBUM_ID)
          .eq("status", "completed")
          .maybeSingle();

        if (error) {
          console.error("Error checking premium access:", error);
          setHasPremiumAccess(false);
        } else {
          setHasPremiumAccess(!!purchaseData);
        }
      } catch (error) {
        console.error("Error checking premium access:", error);
        setHasPremiumAccess(false);
      } finally {
        setLoadingPremiumCheck(false);
      }
    };

    checkPremiumAccess();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    setMobileMenuOpen(false);
    setHasPremiumAccess(false); // Reset premium access on sign out
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
  };

  const handleSignIn = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-transparent border flex-col items-center justify-between py-8 z-50">
        <Link to="/" className="text-2xl font-bold text-foreground hover:text-[hsl(var(--primary))] transition-colors">
          BP
        </Link>
        
        <div className="flex flex-col gap-8 items-center rotate-180" style={{ writingMode: "vertical-rl" }}>
          <Link 
            to="/" 
            className="text-sm tracking-wider text-foreground hover:text-[hsl(var(--primary))] transition-colors"
          >
            BOLINGO Paccy
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === 0 ? "bg-[hsl(var(--primary))]" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </aside>

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 lg:left-24 right-0 z-40 bg-transparent backdrop-blur-sm pt-4">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden text-xl font-bold text-foreground">
            BP
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 ml-8">
            <Link to="/" className="text-foreground/70 hover:text-[hsl(var(--primary))] transition-colors tracking-wide">
              BOLINGO Paccy
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden bg-transparent lg:flex items-center gap-8">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-BP uppercase tracking-wider transition-colors ${
                  isActive(item.path)
                    ? "text-[hsl(var(--primary))]"
                    : "text-foreground hover:text-[hsl(var(--primary))]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Premium Link - Only show if user has purchased specific album */}
            {!loadingPremiumCheck && hasPremiumAccess && (
              <Link
                to={premiumNavItem.path}
                className={`flex items-center gap-1.5 uppercase tracking-wider transition-colors ${
                  isActive(premiumNavItem.path)
                    ? "text-[hsl(var(--primary))]"
                    : "text-foreground hover:text-[hsl(var(--primary))]"
                }`}
              >
                <Crown className="h-3 w-3" />
                {premiumNavItem.label}
              </Link>
            )}

            {/* Desktop Profile Icon with Hover Overlay */}
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-[hsl(var(--accent))] transition-colors">
                <User className="h-5 w-5 text-foreground" />
              </button>

              {/* Profile Overlay Menu */}
              <div className="absolute right-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-card border border-[hsl(var(--border))] rounded-lg shadow-lg overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-muted/50">
                        <p className="text-sm font-medium text-foreground">
                          {user.user_metadata?.first_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {/* Show premium status in profile */}
                        {!loadingPremiumCheck && hasPremiumAccess && (
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="h-3 w-3 text-[hsl(var(--primary))]" />
                            <span className="text-xs text-[hsl(var(--primary))] font-medium">
                              Premium Member
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] transition-colors text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] transition-colors text-foreground"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm uppercase tracking-wider transition-colors ${
                    isActive(item.path)
                      ? "text-[hsl(var(--primary))]"
                      : "text-foreground hover:text-[hsl(var(--primary))]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Premium Link in Mobile Menu */}
              {!loadingPremiumCheck && hasPremiumAccess && (
                <Link
                  to={premiumNavItem.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-1.5 text-sm uppercase tracking-wider transition-colors ${
                    isActive(premiumNavItem.path)
                      ? "text-[hsl(var(--primary))]"
                      : "text-foreground hover:text-[hsl(var(--primary))]"
                  }`}
                >
                  <Crown className="h-3 w-3" />
                  {premiumNavItem.label}
                </Link>
              )}

              {/* Mobile Profile Section */}
              <div className="border-t border-[hsl(var(--border))] pt-4 mt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 mb-2 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground">
                        {user.user_metadata?.first_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {/* Show premium status in mobile profile */}
                      {!loadingPremiumCheck && hasPremiumAccess && (
                        <div className="flex items-center gap-1 mt-1">
                          <Crown className="h-3 w-3 text-[hsl(var(--primary))]" />
                          <span className="text-xs text-[hsl(var(--primary))] font-medium">
                            Premium Member
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;