// CastAmplify — Stripe Webhook
// Runs on Vercel at /api/stripe-webhook
// Marks a creator as paid in Supabase when their Stripe checkout completes.
// Security: we never trust the incoming payload — we fetch the session
// directly from Stripe using our secret key and act only on Stripe's answer.

const SUPABASE_URL = 'https://wuzzdlihjckgtzmdbxwm.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1enpkbGloamNrZ3R6bWRieHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTk4NTUsImV4cCI6MjA3NzIzNTg1NX0.LDtLDcQzoJDs2SoBhDLtLl-TjfvJqIocnAgBpU4pWQ4';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const event = req.body || {};
        if (event.type !== 'checkout.session.completed') {
            return res.status(200).json({ received: true, ignored: event.type });
        }
        const sessionId = event.data && event.data.object && event.data.object.id;
        if (!sessionId) {
            return res.status(400).json({ error: 'No session id' });
        }

        // Verify with Stripe directly — the source of truth
        const sResp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
            headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY }
        });
        const session = await sResp.json();
        if (!sResp.ok) {
            console.error('Stripe verify error:', session);
            return res.status(502).json({ error: 'Verification failed' });
        }
        if (session.payment_status !== 'paid') {
            return res.status(200).json({ received: true, status: session.payment_status });
        }
        const email = (session.customer_details && session.customer_details.email) || session.customer_email;
        if (!email) {
            return res.status(200).json({ received: true, note: 'no email on session' });
        }

        // Mark paid in Supabase
        const uResp = await fetch(SUPABASE_URL + '/rest/v1/creator_profiles?email=eq.' + encodeURIComponent(email.toLowerCase()), {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': 'Bearer ' + SUPABASE_ANON,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ paid: true, stripe_session: sessionId })
        });
        const updated = await uResp.json().catch(() => []);
        if (!Array.isArray(updated) || updated.length === 0) {
            // No profile row yet — create one so the unlock still works
            await fetch(SUPABASE_URL + '/rest/v1/creator_profiles', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON,
                    'Authorization': 'Bearer ' + SUPABASE_ANON,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({ email: email.toLowerCase(), paid: true, stripe_session: sessionId })
            });
        }
        console.log('Creator marked paid:', email);
        return res.status(200).json({ received: true, paid: email });
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
