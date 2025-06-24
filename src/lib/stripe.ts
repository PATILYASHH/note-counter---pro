import { loadStripe } from '@stripe/stripe-js';
import { pricingService } from './pricing';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const isStripeConfigured = () => {
  return !!stripePublishableKey;
};

export const stripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(planId: string, userId: string, email: string) {
    try {
      // In a real implementation, this would call your backend API
      // which would create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
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
  async simulatePayment(planId: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `sub_${Date.now()}`,
          planId,
        });
      }, 2000);
    });
  }
};

// Stripe price IDs (these would be configured in your Stripe dashboard)
export const STRIPE_PRICES = {
  monthly: 'price_monthly_100', // $1/month
  quarterly: 'price_quarterly_300', // $3/3 months
  annual: 'price_annual_1000', // $10/year
};