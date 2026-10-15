# SA SPORTS

Premium leather goods and boxing equipment website. Next.js 14, React, TypeScript, Tailwind CSS, Supabase. Every tool used has a free tier and nothing in the code requires payment.

## What works, and what was tested

| Feature | Status |
|---|---|
| Storefront (home, shop, filters, product pages, cart, order-request checkout) | Built. Production build passes; all pages tested to load. Works with demo data before Supabase is connected. |
| Contact, wholesale, custom-work forms | Built. Validation, honeypot, rate limit tested. **Saving to your database is not yet tested end to end**, because that needs your Supabase project. Follow Part 6 to test it yourself. |
| Order requests | Built. Prices are computed inside the database (`place_order`), never taken from the browser. Needs your Supabase project to test. |
| Admin dashboard (products, categories, stock, images, inquiries, wholesale, orders) | Built. Secured by Supabase Auth plus Row Level Security. Needs your Supabase project to test. |
| Email notifications | Optional and **off by default**. See Part 7. The site never says an email was sent. |
| Online card payments | **Not included.** Needs a payment provider, which charges fees per sale. The site uses an order request: you confirm and collect payment by email. |
| Product photos | None are bundled (no paid or unlicensed images). The site draws original illustrations until you upload your own photos in the admin. |

## Free services and the honest limits

- **GitHub Free**: source code. Free.
- **Supabase Free**: database, login, image storage. Free projects pause after about a week without activity (you unpause with one click), and have storage and bandwidth caps. Compress product photos to under 1.5 MB.
- **Vercel Hobby**: free hosting, **but its terms limit it to personal, non-commercial use**. A shop that sells goods is commercial. Read Vercel's current terms before you launch publicly. Free alternatives that you should check the current terms of: Cloudflare Pages, Netlify. This Next.js app deploys to Vercel most easily, so use Vercel to try the site, and verify eligibility before taking real customer orders.
- **Resend** (optional email): has a free plan with daily and monthly limits. Without your own verified domain it can only email the address you registered with, which is exactly what is needed to notify yourself. Check their current limits.
- Fonts (Cormorant Garamond, Jost) and icons (Lucide) are open source and installed through npm.

Free-tier limits change. Confirm current terms on each provider's pricing page.

## Part 1. Run it on your computer

1. Install **Node.js** (LTS version) from nodejs.org. Free.
2. Open a terminal in this folder and run:
   ```
   npm install
   cp .env.example .env.local
   npm run dev
   ```
3. Open http://localhost:3000. You will see the demo catalog.

## Part 2. Put the code on GitHub

1. Create a free account at github.com, click **New repository**, name it `sa-sports`, keep it **Private**, and create it.
2. In this folder:
   ```
   git init
   git add .
   git commit -m "SA SPORTS website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/sa-sports.git
   git push -u origin main
   ```
   `.env.local` is in `.gitignore`, so your keys are never uploaded.

## Part 3. Create the Supabase project (free)

1. Sign up at supabase.com, click **New project**, choose the **Free** plan, pick a region near your customers, and set a database password (save it).
2. Open **SQL Editor > New query**. Paste all of `supabase/schema.sql`, click **Run**.
3. New query again: paste all of `supabase/seed.sql`, click **Run**. This loads the categories and sample products.
4. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key.
5. Put them in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...your Project URL...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...your anon key...
   ```
   The anon key is meant to be public. **Never** put the `service_role` key anywhere in this project; it is not needed.
6. Restart `npm run dev`. The "Demo catalog" notice on the shop page disappears.

## Part 4. Create your admin account

1. In Supabase: **Authentication > Users > Add user > Create new user**. Enter your email and a strong password, tick **Auto Confirm User**.
2. In **Authentication > Sign In / Providers**, turn **off** "Allow new users to sign up", so nobody else can register.
3. Open `supabase/make-admin.sql`, replace the email with yours, paste into the SQL Editor and **Run**.
4. Go to `/admin` on your site and sign in. Only users listed in the `admins` table can see or change anything.

## Part 5. Deploy

1. Sign in at vercel.com with GitHub. Click **Add New > Project**, import `sa-sports`.
2. Under **Environment Variables** add the two `NEXT_PUBLIC_SUPABASE_*` values (and the optional email ones from Part 7).
3. Click **Deploy**. You get a free `something.vercel.app` address. No custom domain is needed.
4. In Supabase **Authentication > URL Configuration**, set **Site URL** to your Vercel address.
5. Re-read the Vercel Hobby note above before using it for a real business.

## Part 6. Test everything (do not skip)

1. Shop page shows your products (no demo notice).
2. Submit the **Contact** form. In `/admin > Inquiries` it must appear.
3. Submit the **Wholesale** form. It must appear in `/admin > Wholesale`.
4. Add a product to the cart, send an **Order request**. Note the reference. It must appear in `/admin > Orders` with the correct total.
5. In Orders set the status to **confirmed** and check the product's stock went down in Products.
6. In Products: add a product with an uploaded photo, edit its price, then check the shop.
7. Sign out, open `/admin` in a private window: you must see only the sign-in form.

## Part 7. Optional email notifications (free)

1. Create a free account at resend.com and create an API key.
2. Set (locally in `.env.local` and on Vercel):
   ```
   RESEND_API_KEY=your key
   NOTIFY_EMAIL_TO=the email you signed up to Resend with
   ```
3. Submit a test form. Check your inbox. If nothing arrives, the inquiry is still saved in the database; look at the Vercel function logs for `email notification: failed`.

If you skip this, check the admin dashboard for new inquiries instead; that always works.

## Part 8. Make it yours

- `src/lib/site.ts`: your real email, phone, address, hours. **These are placeholders now.**
- `src/app/about/page.tsx`: your real company story.
- Admin > Products: upload real photos, set real prices and stock.
- `src/lib/seed.json` holds the sample products; delete them in the admin once you add your own.

## Security notes

- Row Level Security is enabled on every table. The public can only read active products and categories and submit forms. Only admins can read inquiries, leads and orders.
- Orders can only be created through `place_order()`, which checks stock and uses database prices.
- No secret key is used in the browser. The optional Resend key is server-only.
- The rate limiter is in-memory and best-effort on serverless hosting. For heavy spam, enable Supabase CAPTCHA or Cloudflare Turnstile (both have free tiers).

## Project map

```
src/app          pages and API routes
src/components   UI, forms, admin dashboard
src/lib          data, cart, validation, Supabase clients
supabase         schema.sql, seed.sql, make-admin.sql
```
