import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Songs from "./pages/Songs";
import Shop from "./pages/Shop";
import Album from "./pages/Album";
import Tour from "./pages/Tour";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import PremiumContent from "./pages/PremiumContent"; // Add this import
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/songs" element={<Layout><Songs /></Layout>} />
            <Route path="/gallery" element={<Layout><Shop /></Layout>} />
            <Route path="/album" element={<Layout><Album /></Layout>} />
            <Route path="/tour" element={<Layout><Tour /></Layout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            {/* ADD THE PREMIUM CONTENT ROUTE - Protected by the component itself */}
            <Route path="/premium-content" element={<Layout><PremiumContent /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;