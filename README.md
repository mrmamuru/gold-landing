# Gold Investor — Landing page + Admin

- `/` → Landing page (FB ads-এর লিংক এটা). ৩ সেকেন্ড পর অটো WhatsApp গ্রুপে যায়, বাটনেও যায়।
- `/admin` → পাসওয়ার্ড দিয়ে WhatsApp লিংক পরিবর্তন।
- `/api/go` → সবসময় বর্তমান WhatsApp লিংকে redirect করে।

## Vercel-এ Setup (একবারই)
1. এই ফোল্ডার GitHub-এ push করুন → Vercel-এ Import করুন (Framework: **Other**)।
2. Vercel Project → **Storage** → **Upstash for Redis** (free) → Create → এই project-এ Connect।
   (এতে `KV_REST_API_URL` আর `KV_REST_API_TOKEN` নিজে থেকেই যোগ হবে)
3. Project → **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` = আপনার শক্ত পাসওয়ার্ড
   - `DEFAULT_WA_LINK` = (optional) শুরুর WhatsApp লিংক
4. **Redeploy** করুন।
5. `yourdomain.com/admin` → লগইন → লিংক সেভ।

## Customize
- অটো-redirect সময়: `index.html` → `AUTO_REDIRECT_SECONDS` (0 = বন্ধ)
- Facebook Pixel: `index.html` → `YOUR_PIXEL_ID` বদলান (button click / redirect-এ `Lead` event যায়)
