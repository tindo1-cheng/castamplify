export default function handler(req, res) {
  const country = req.headers['x-vercel-ip-country'] || 'US';
  const city = decodeURIComponent(req.headers['x-vercel-ip-city'] || '');
  res.status(200).json({ country, city });
}
