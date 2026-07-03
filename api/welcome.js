// CastAmplify — Welcome Email
// Runs on Vercel as a serverless function at /api/welcome

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email } = req.body || {};
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const firstName = (name || 'Creator').split(' ')[0];

        const html = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #0b1220; color: #ededf2; border-radius: 14px; padding: 36px;">
            <div style="text-align:center; margin-bottom: 24px;">
                <span style="display:inline-block; border:1px solid #C9A84C; color:#C9A84C; border-radius:8px; padding:8px 14px; font-weight:bold; letter-spacing:1px;">CA</span>
            </div>
            <h1 style="font-size: 24px; margin: 0 0 16px; color: #ffffff; text-align:center;">Welcome to CastAmplify, ${firstName} 👋</h1>
            <p style="font-size: 15px; line-height: 1.7; color: #b8c0d0;">Your 30-day free trial is live. Your AI back office is standing by to write your show notes, captions and titles the moment you register your first episode.</p>
            <p style="font-size: 15px; line-height: 1.7; color: #b8c0d0;">Your next steps:</p>
            <p style="font-size: 15px; line-height: 1.9; color: #b8c0d0;">
                1. Complete your creator profile<br>
                2. Register your first episode — and watch the AI write for you<br>
                3. Connect your platforms
            </p>
            <div style="text-align:center; margin: 30px 0;">
                <a href="https://www.castamplify.com" style="background: #5046e5; color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-weight: bold; display: inline-block;">Open my dashboard →</a>
            </div>
            <p style="font-size: 12px; color: #8b96ab; text-align:center; margin-top: 28px;">CastAmplify — the operating system behind the world's most influential voices.<br>You received this because you created a CastAmplify account.</p>
        </div>`;

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: email, name: name || 'Creator' }] }],
                from: { email: 'hello@castamplify.com', name: 'CastAmplify' },
                subject: 'Welcome to CastAmplify, ' + firstName + ' — your AI back office is live 🎙️',
                content: [{ type: 'text/html', value: html }]
            })
        });

        if (response.status === 202) {
            return res.status(200).json({ sent: true });
        }
        const errText = await response.text();
        console.error('SendGrid error:', response.status, errText);
        return res.status(502).json({ error: 'Email send failed', detail: response.status });
    } catch (err) {
        console.error('Welcome function error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
