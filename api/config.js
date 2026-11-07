// GET /api/config → { auto: true|false }  (public — landing page reads this)
const { getAuto } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ auto: await getAuto() }));
};
