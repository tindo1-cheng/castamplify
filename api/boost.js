// CastAmplify — AmpliBoost Algorithm Optimizer
// Runs on Vercel as a serverless function at /api/boost
// Requires environment variable ANTHROPIC_API_KEY set in Vercel project settings.

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, summary, niche, audience } = req.body || {};
        if (!title) {
            return res.status(400).json({ error: 'Episode title is required' });
        }

        const prompt = `You are AmpliBoost, the algorithm optimization engine of CastAmplify, a global creator platform.
A creator wants their episode packaged for maximum discoverability on YouTube, Spotify, TikTok and Instagram.

Episode title: ${title}
Episode summary: ${summary || '(no summary provided)'}
Creator niche: ${niche || 'general'}
Target audience: ${audience || 'general listeners worldwide'}

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "titles": ["Three click-worthy title options under 70 characters each, front-loaded with the strongest keywords, no clickbait lies."],
  "youtubeDescription": "A keyword-rich YouTube description of 150-200 words: strong first two lines (visible before the fold), natural keyword usage, a subscribe call to action, and 3 timestamps placeholders like 00:00 Topic.",
  "spotifySummary": "A compelling 2-3 sentence Spotify episode summary optimised for podcast search.",
  "tags": ["12-15 search tags/keywords, ordered from most to least important, lowercase, no # symbol."],
  "hashtags": {
    "tiktok": ["5 hashtags with # for TikTok, mixing one broad, three niche, one trending-style."],
    "instagram": ["8 hashtags with # for Instagram, mixing sizes."]
  },
  "hooks": ["Three spoken hook lines of one sentence each for the first 5 seconds of a short-form clip, each a different angle: curiosity, bold claim, question."],
  "postingTimes": ["Three suggested posting windows with day and time (creator local time) and one short reason each, based on general engagement patterns for this niche."]
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
                max_tokens: 1800,
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
            titles: Array.isArray(parsed.titles) ? parsed.titles.slice(0, 3) : [],
            youtubeDescription: parsed.youtubeDescription || '',
            spotifySummary: parsed.spotifySummary || '',
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            hashtags: parsed.hashtags || { tiktok: [], instagram: [] },
            hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 3) : [],
            postingTimes: Array.isArray(parsed.postingTimes) ? parsed.postingTimes.slice(0, 3) : []
        });
    } catch (err) {
        console.error('Boost function error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
