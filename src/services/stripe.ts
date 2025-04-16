import { loadStripe } from "@stripe/stripe-js";
import { CartItem } from "@/components/cart/CartContext";

// Initialize Stripe with your publishable key
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    // Use environment variable for the Stripe publishable key
    // This should be set in your environment variables
    const publishableKey =
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Create a checkout session with Stripe
export const createCheckoutSession = async (
  items: CartItem[],
): Promise<CheckoutSessionResponse> => {
  try {
    // This would typically call your backend API to create a Stripe checkout session
    // For now, we'll mock this with a simple implementation
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const session = await response.json();
    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

// Redirect to the Stripe Checkout page
export const redirectToCheckout = async (
  sessionData: CheckoutSessionResponse,
) => {
  try {
    // If we have a URL from the session, use that directly
    if (sessionData.url) {
      window.location.href = sessionData.url;
      return;
    }

    // Otherwise, use the Stripe.js redirect method
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionData.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
};
