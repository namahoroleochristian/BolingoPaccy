import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import Songs from "./pages/Songs";
import Images from "./pages/Images";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Tour from "./pages/Tour";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="bolingo-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/songs" element={<Layout><Songs /></Layout>} />
              <Route path="/images" element={<Layout><Images /></Layout>} />
              <Route path="/album" element={<Layout><Albums /></Layout>} />
              <Route path="/album/:id" element={<Layout><AlbumDetail /></Layout>} />
              <Route path="/tour" element={<Layout><Tour /></Layout>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
