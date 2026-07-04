export default async function handler(req, res) {
  const feedUrl = req.query.url;
  if (!feedUrl || !feedUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Please provide a valid feed URL' });
  }
  try {
    const r = await fetch(feedUrl, {
      headers: { 'User-Agent': 'CastAmplify/1.0 (+https://castamplify.com)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw new Error('Feed returned ' + r.status);
    const xml = await r.text();

    const pick = (src, tag) => {
      const m = src.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : '';
    };
    const pickAttr = (src, tag, attr) => {
      const m = src.match(new RegExp('<' + tag + '[^>]*' + attr + '="([^"]+)"', 'i'));
      return m ? m[1] : '';
    };

    const channel = xml.split(/<item[\s>]/i)[0];
    const show = {
      title: pick(channel, 'title'),
      description: pick(channel, 'description').slice(0, 400),
      author: pick(channel, 'itunes:author') || pick(channel, 'author'),
      image: pickAttr(channel, 'itunes:image', 'href') || pick(channel.match(/<image>[\s\S]*?<\/image>/i)?.[0] || '', 'url'),
      language: pick(channel, 'language')
    };

    const items = xml.split(/<item[\s>]/i).slice(1, 11).map(chunk => ({
      title: pick(chunk, 'title'),
      date: pick(chunk, 'pubDate'),
      duration: pick(chunk, 'itunes:duration'),
      audio: pickAttr(chunk, 'enclosure', 'url')
    }));

    return res.status(200).json({ show, episodes: items, episodeCount: xml.split(/<item[\s>]/i).length - 1 });
  } catch (e) {
    return res.status(500).json({ error: 'Could not read that feed. Check the URL and try again.' });
  }
}
