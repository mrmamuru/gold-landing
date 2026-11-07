// GET /api/go → 302 redirect to the current WhatsApp group link
const { getLink } = require('./_store');

module.exports = async (req, res) => {
  const link = await getLink();
  res.setHeader('Cache-Control', 'no-store');
  if (!link) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('WhatsApp link not set yet. Please set it from /admin');
  }
  res.statusCode = 302;
  res.setHeader('Location', link);
  res.end();
};
