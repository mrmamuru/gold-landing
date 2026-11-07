// GET  /api/link            → { link }   (admin only — needs password)
// POST /api/link {link}     → saves new link (admin only)
// Auth: header "x-admin-password" must equal env ADMIN_PASSWORD
const crypto = require('crypto');
const { getLink, setLink, getAuto, setAuto, isValidWaLink } = require('./_store');

function authorized(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const got = String(req.headers['x-admin-password'] || '');
  if (!expected || got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) return resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch { resolve({}); } });
  });
}

function json(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  if (!authorized(req)) return json(res, 401, { error: 'ভুল পাসওয়ার্ড' });

  if (req.method === 'GET') return json(res, 200, { link: await getLink(), auto: await getAuto() });

  if (req.method === 'POST') {
    const body = await readBody(req);
    try {
      if (body.link !== undefined) {
        const clean = String(body.link || '').trim();
        if (!isValidWaLink(clean)) {
          return json(res, 400, { error: 'সঠিক WhatsApp লিংক দিন (https://chat.whatsapp.com/...)' });
        }
        await setLink(clean);
      }
      if (body.auto !== undefined) await setAuto(!!body.auto);
      return json(res, 200, { ok: true, link: await getLink(), auto: await getAuto() });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  json(res, 405, { error: 'Method not allowed' });
};
