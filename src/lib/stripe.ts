import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const isStripeConfigured = () => {
  return !!stripePublishableKey;
};

export const stripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(priceId: string, userId: string, email: string) {
    try {
      // In a real implementation, this would call your backend API
      // which would create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          email,
          successUrl: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripeInstance = await stripe;
      if (!stripeInstance) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Simulate successful payment for demo purposes
  async simulatePayment(plan: 'monthly' | 'annual') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `sub_${Date.now()}`,
          plan,
        });
      }, 2000);
    });
  }
};

// Stripe price IDs (these would be configured in your Stripe dashboard)
export const STRIPE_PRICES = {
  monthly: 'price_monthly_999', // $9.99/month
  annual: 'price_annual_10000', // $100/year
};