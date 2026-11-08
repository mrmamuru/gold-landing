// GET  /api/link                         → { link, link2, auto, active }  (admin only)
// POST /api/link {link?, link2?, auto?}  → saves (admin only); link2 '' = rotation off
// Auth: header "x-admin-password" must equal env ADMIN_PASSWORD
const crypto = require('crypto');
const { getLink, setLink, getLink2, setLink2, activeSlot, getAuto, setAuto, isValidWaLink } = require('./_store');

async function state() {
  const [link, link2, auto] = await Promise.all([getLink(), getLink2(), getAuto()]);
  return { link, link2, auto, active: activeSlot(!!link2) };
}

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
  if (!process.env.ADMIN_PASSWORD) {
    return json(res, 500, { error: 'Vercel-এ ADMIN_PASSWORD সেট করা নেই — Settings → Environment Variables এ যোগ করে Redeploy করুন' });
  }
  if (!authorized(req)) return json(res, 401, { error: 'ভুল পাসওয়ার্ড' });

  if (req.method === 'GET') return json(res, 200, await state());

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
      if (body.link2 !== undefined) {
        const clean2 = String(body.link2 || '').trim(); // empty = rotation off
        if (clean2 && !isValidWaLink(clean2)) {
          return json(res, 400, { error: 'লিংক ২ সঠিক নয় (https://chat.whatsapp.com/...) — না চাইলে খালি রাখুন' });
        }
        await setLink2(clean2);
      }
      if (body.auto !== undefined) await setAuto(!!body.auto);
      return json(res, 200, { ok: true, ...(await state()) });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  json(res, 405, { error: 'Method not allowed' });
};
