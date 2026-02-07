import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div 
  className="min-h-screen text-foreground 
             bg-[linear-gradient(135deg,#895B26_0%,black_60%)]"
>
  <Navigation />
  <main className="lg:ml-24 pt-20">
    {children}
  </main>
</div>
  );
};

export default Layout;
