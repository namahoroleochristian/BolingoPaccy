import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/songs", label: "Songs" },
    { path: "/gallery", label: "Gallery" },
    { path: "/album", label: "Album" },
    { path: "/tour", label: "Tour" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-24 bg-black flex-col items-center justify-between py-8 z-50">
        <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
          BP
        </Link>
        
        <div className="flex flex-col gap-8 items-center rotate-180" style={{ writingMode: "vertical-rl" }}>
          <Link 
            to="/" 
            className="text-sm tracking-wider text-foreground hover:text-primary transition-colors"
          >
            BOLINGO Paccy
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === 0 ? "bg-primary" : "bg-muted"
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
            <Link to="/" className="text-foreground/70 hover:text-primary transition-colors tracking-wide">
              BOLINGO Paccy
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden bg-transparent lg:flex items-center gap-8">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm uppercase tracking-wider transition-colors ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
          <div className="lg:hidden bg-card  animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm uppercase tracking-wider transition-colors ${
                    isActive(item.path)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
