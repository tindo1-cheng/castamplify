// CastAmplify — Stripe Checkout
// Runs on Vercel at /api/checkout
// Requires environment variable STRIPE_SECRET_KEY in Vercel project settings.

const PRICES = {
    foundation: 'price_1ToMoPQZa2D6NwOGipyD24d8',
    growth: 'price_1ToMtIQZa2D6NwOGcjfb8ghN',
    professional: 'price_1ToMu8QZa2D6NwOGPmnrqQwM',
    enterprise: 'price_1ToMujQZa2D6NwOGk1MfUPdB'
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { plan, email } = req.body || {};
        const priceId = PRICES[plan];
        if (!priceId) {
            return res.status(400).json({ error: 'Unknown plan' });
        }
        const params = new URLSearchParams();
        params.append('mode', 'subscription');
        params.append('line_items[0][price]', priceId);
        params.append('line_items[0][quantity]', '1');
        params.append('success_url', 'https://www.castamplify.com/?payment=success');
        params.append('cancel_url', 'https://www.castamplify.com/?payment=cancelled');
        if (email) params.append('customer_email', email);

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Stripe error:', data);
            return res.status(502).json({ error: 'Checkout creation failed' });
        }
        return res.status(200).json({ url: data.url });
    } catch (err) {
        console.error('Checkout function error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
