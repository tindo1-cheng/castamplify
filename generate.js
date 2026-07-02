// CastAmplify — AI Episode Content Generator
// Runs on Vercel as a serverless function at /api/generate
// Requires environment variable ANTHROPIC_API_KEY set in Vercel project settings.

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, description, niche, name } = req.body || {};
        if (!title) {
            return res.status(400).json({ error: 'Episode title is required' });
        }

        const prompt = `You are the AI back office of CastAmplify, a global creator platform.
A podcaster has just registered a new episode. Generate launch content for it.

Creator name: ${name || 'the creator'}
Creator niche: ${niche || 'general'}
Episode title: ${title}
Episode description: ${description || '(no description provided)'}

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "showNotes": "Professional, engaging show notes of 120-180 words written in the creator's voice, with a hook opening and a call to action to subscribe.",
  "captions": ["Three short social media captions of 1-2 sentences each, each with a different angle, suitable for X/Instagram/TikTok, no hashtags in the first, 2-3 relevant hashtags in the second and third."],
  "titles": ["Three alternative episode title suggestions, each punchier than the original."]
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Anthropic API error:', response.status, errText);
            return res.status(502).json({ error: 'AI generation failed', detail: response.status });
        }

        const data = await response.json();
        const text = (data.content || [])
            .map(block => (block.type === 'text' ? block.text : ''))
            .join('')
            .replace(/```json|```/g, '')
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse failed:', text);
            return res.status(502).json({ error: 'AI returned unexpected format' });
        }

        return res.status(200).json({
            showNotes: parsed.showNotes || '',
            captions: Array.isArray(parsed.captions) ? parsed.captions.slice(0, 3) : [],
            titles: Array.isArray(parsed.titles) ? parsed.titles.slice(0, 3) : []
        });
    } catch (err) {
        console.error('Generate function error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
