import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// Lazy initialization - 실제 사용할 때만 초기화
export const getStripe = (): Stripe => {
    if (!stripeInstance) {
        const apiKey = process.env.STRIPE_SECRET_KEY;

        if (!apiKey) {
            console.warn('⚠️  STRIPE_SECRET_KEY not found - Stripe features will be disabled');
            // 빈 Stripe 인스턴스 반환 (에러 방지)
            throw new Error('Stripe API key not configured');
        }

        stripeInstance = new Stripe(apiKey, {
            apiVersion: '2024-11-20.acacia',
        });

        console.log('✅ Stripe configured successfully');
    }

    return stripeInstance;
};

// 기본 export (optional - payment controller에서 사용)
export default {
    get paymentIntents() {
        return getStripe().paymentIntents;
    }
};
