import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart, CartItem } from "./cart/CartContext";
import {
  createCheckoutSession,
  redirectToCheckout,
  getStripe,
} from "@/services/stripe";
import { Loader2, CreditCard, ShieldCheck, AlertTriangle } from "lucide-react";

interface CheckoutProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({
  onCancel = () => {},
  onSuccess = () => {},
}) => {
  const {
    items,
    totalPrice,
    checkoutStatus,
    setCheckoutStatus,
    setLastOrderId,
    clearCart,
  } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [stripeBlocked, setStripeBlocked] = useState<boolean>(false);

  // Use the checkout status from context instead of local state
  const isProcessing = checkoutStatus === "processing";

  // Check if Stripe is being blocked by ad blockers
  useEffect(() => {
    const checkStripeAvailability = async () => {
      try {
        // Try to load Stripe - this will fail if blocked by ad blockers
        await getStripe();
        setStripeBlocked(false);
      } catch (err) {
        console.error("Stripe loading error:", err);
        setStripeBlocked(true);
      }
    };

    // Also check for blocked resources in console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(" ");
      if (
        errorString.includes("stripe.com") &&
        (errorString.includes("ERR_BLOCKED_BY_CLIENT") ||
          errorString.includes("Failed to fetch"))
      ) {
        setStripeBlocked(true);
      }
      originalConsoleError.apply(console, args);
    };

    checkStripeAvailability();

    // Restore original console.error when component unmounts
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (stripeBlocked) {
      setError(
        "Stripe resources are being blocked. Please disable your ad blocker or try a different browser.",
      );
      return;
    }

    setCheckoutStatus("processing");
    setError(null);

    try {
      // Create a checkout session
      const sessionData = await createCheckoutSession(items);

      // Redirect to Stripe Checkout
      await redirectToCheckout(sessionData);

      // Store the session ID as the order ID
      setLastOrderId(sessionData.sessionId);
      setCheckoutStatus("success");

      // Clear the cart after successful checkout
      clearCart();

      // Call the success callback
      onSuccess();
    } catch (err) {
      console.error("Checkout error:", err);

      // Check if the error is related to Stripe being blocked
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes("stripe.com") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("ERR_BLOCKED_BY_CLIENT")
      ) {
        setError(
          "Stripe resources are being blocked. Please disable your ad blocker or try a different browser.",
        );
        setStripeBlocked(true);
      } else {
        setError("Failed to process checkout. Please try again.");
      }

      setCheckoutStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Order Summary</h3>
          <div className="text-sm space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t mt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {stripeBlocked ? (
          <div className="pt-4 space-y-2 bg-amber-50 p-3 rounded-md border border-amber-200">
            <div className="flex items-start gap-2 text-amber-700">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Payment system blocked</p>
                <p className="text-sm">
                  It appears that Stripe payment resources are being blocked by
                  your browser or extensions. Please disable your ad blocker or
                  try a different browser to complete your purchase.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck size={16} />
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={isProcessing || items.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} className="mr-2" />
              Pay ${totalPrice.toFixed(2)}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Checkout;
