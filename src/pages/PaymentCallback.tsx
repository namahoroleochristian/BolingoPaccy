import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

type PaymentStatus = "loading" | "success" | "failed" | "pending";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      // Get Pesapal callback params
      const orderTrackingId = searchParams.get("OrderTrackingId");
      const orderMerchantReference = searchParams.get("OrderMerchantReference");

      if (!orderTrackingId && !orderMerchantReference) {
        // Try to get from localStorage
        const pendingRef = localStorage.getItem("pending_order_ref");
        if (pendingRef) {
          // Verify with merchant reference
          try {
            const response = await supabase.functions.invoke("verify-transaction", {
              body: { merchantReference: pendingRef },
            });

            if (response.data?.status === "completed") {
              setStatus("success");
              setMessage("Your payment was successful! You now have access to the album.");
              localStorage.removeItem("pending_order_ref");
            } else if (response.data?.status === "failed") {
              setStatus("failed");
              setMessage("Your payment was not successful. Please try again.");
              localStorage.removeItem("pending_order_ref");
            } else {
              setStatus("pending");
              setMessage("Your payment is being processed. Please wait...");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            setStatus("pending");
            setMessage("Unable to verify payment status. Please check your email for confirmation.");
          }
        } else {
          setStatus("failed");
          setMessage("No payment information found.");
        }
        return;
      }

      // Verify with Pesapal params
      try {
        const response = await supabase.functions.invoke("verify-transaction", {
          body: {
            orderTrackingId,
            merchantReference: orderMerchantReference,
          },
        });

        if (response.data?.status === "completed") {
          setStatus("success");
          setMessage("Your payment was successful! You now have access to the album.");
          localStorage.removeItem("pending_order_ref");
        } else if (response.data?.status === "failed") {
          setStatus("failed");
          setMessage("Your payment was not successful. Please try again.");
          localStorage.removeItem("pending_order_ref");
        } else {
          setStatus("pending");
          setMessage("Your payment is being processed. This may take a few moments...");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("pending");
        setMessage("Unable to verify payment status. Please check your email for confirmation.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-16 w-16 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-destructive" />;
      case "pending":
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const renderTitle = () => {
    switch (status) {
      case "loading":
        return "Verifying Payment...";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      case "pending":
        return "Payment Processing";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md p-8 bg-card border-border text-center">
          <div className="flex justify-center mb-6">{renderIcon()}</div>
          
          <h1 className="text-2xl font-bold mb-4">{renderTitle()}</h1>
          
          <p className="text-muted-foreground mb-8">{message}</p>

          {status === "success" && (
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/album")}
                className="w-full bg-[#895B26] hover:bg-[#895B26]/90"
              >
                Listen Now
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <Button
                onClick={() => navigate(-1)}
                className="w-full bg-[#895B26] hover:bg-[#895B26]/90"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}

          {status === "pending" && (
            <div className="space-y-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#895B26] hover:bg-[#895B26]/90"
              >
                Check Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentCallback;
