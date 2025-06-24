// Exchange rates and pricing configuration
export interface PricingPlan {
  id: 'monthly' | 'quarterly' | 'annual';
  name: string;
  priceUSD: number;
  priceINR: number;
  period: string;
  savings?: number;
  savingsPercent?: number;
}

// Current exchange rate (in production, this would come from an API)
const USD_TO_INR_RATE = 83.50;

export const pricingService = {
  // Get current exchange rate
  getExchangeRate(): number {
    return USD_TO_INR_RATE;
  },

  // Convert USD to INR
  convertToINR(usdAmount: number): number {
    return Math.round(usdAmount * USD_TO_INR_RATE);
  },

  // Get pricing plans
  getPricingPlans(): PricingPlan[] {
    const monthlyUSD = 1;
    const quarterlyUSD = 3;
    const annualUSD = 10;

    return [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        priceUSD: monthlyUSD,
        priceINR: this.convertToINR(monthlyUSD),
        period: 'month',
      },
      {
        id: 'quarterly',
        name: 'Quarterly Plan',
        priceUSD: quarterlyUSD,
        priceINR: this.convertToINR(quarterlyUSD),
        period: '3 months',
        savings: (monthlyUSD * 3) - quarterlyUSD,
        savingsPercent: Math.round(((monthlyUSD * 3) - quarterlyUSD) / (monthlyUSD * 3) * 100),
      },
      {
        id: 'annual',
        name: 'Annual Plan',
        priceUSD: annualUSD,
        priceINR: this.convertToINR(annualUSD),
        period: 'year',
        savings: (monthlyUSD * 12) - annualUSD,
        savingsPercent: Math.round(((monthlyUSD * 12) - annualUSD) / (monthlyUSD * 12) * 100),
      }
    ];
  },

  // Format price based on currency
  formatPrice(plan: PricingPlan, currency: 'USD' | 'INR'): string {
    if (currency === 'INR') {
      return `₹${plan.priceINR}`;
    }
    return `$${plan.priceUSD}`;
  },

  // Get savings text
  getSavingsText(plan: PricingPlan, currency: 'USD' | 'INR'): string | null {
    if (!plan.savings || !plan.savingsPercent) return null;
    
    const savingsAmount = currency === 'INR' 
      ? `₹${this.convertToINR(plan.savings)}`
      : `$${plan.savings}`;
    
    return `Save ${savingsAmount} (${plan.savingsPercent}%)`;
  }
};