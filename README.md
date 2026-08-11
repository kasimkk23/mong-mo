# Mong Mo — Restaurant Website

A fast, responsive, no-build website for **Mong Mo** (vegane vietnamesische Küche), with a reservation form that emails booking requests straight to the restaurant's inbox.

Plain HTML/CSS/JS — no framework, no build step, no server required. Open `index.html` in a browser or host it anywhere that serves static files.

## Files

```
index.html      Page content & structure
css/style.css   All styling (colors taken from the printed menu: sage / forest green / cream / terracotta)
js/script.js    Mobile nav, menu tabs, reservation form submission
README.md       This file
```

## 0. Languages

The site ships in 6 languages: **German** (default), **English, French, Italian, Spanish, and Polish** — the next five most-spoken EU languages after German. A switcher in the header (top right, 🇩🇪 DE / 🇬🇧 EN / 🇫🇷 FR / 🇮🇹 IT / 🇪🇸 ES / 🇵🇱 PL) lets visitors change it; the choice is remembered (`localStorage`) and the site also auto-detects the visitor's browser language on first visit, falling back to German if it's not one of the six.

All translations live in [js/i18n.js](js/i18n.js) as one flat key → string dictionary per language (e.g. `"hero.text"`). To edit copy, change the value there — the HTML elements just carry a `data-i18n="key"` attribute and get their text filled in by [js/script.js](js/script.js) on load / language switch. To add a 7th language: copy one language block in `i18n.js`, translate every value, add its code to `SUPPORTED_LANGS` at the bottom of that file, and add an `<option>` to the `#langSwitch` select in `index.html`.

Menu dish names of Vietnamese origin (e.g. *Đậu Phụ Chiên Sốt Cà Chua*, *Sườn Sả Ớt*) are kept untranslated across all languages, as is standard practice — only their descriptions are translated.

**Translation coverage:** German and English are fully translated for every string on the site, including all ~90 individual menu items across Vorspeisen, Hauptspeisen, Mittagskarte, Getränke and Nachtisch. French, Italian, Spanish and Polish are fully translated for all *structural* text — navigation, section headings, sub-tabs, form fields, notes, the drink sub-headings, the dessert glossary, etc. (~190 keys each). Individual dish/drink **names and descriptions** in those four languages currently fall back to German (the `t()` helper in `script.js` automatically falls back to the German string when a key is missing in the active language, so nothing ever renders blank — it just shows German text for those specific items). To finish translating item-level copy into FR/IT/ES/PL, search `i18n.js` for the `item.*` and `lunch.*` keys in the `en` block and add matching entries to the other four language blocks.

## 0.5 Photos

Real photos of Mong Mo (confirmed by the client, not stock/AI) live in [assets/photos/](assets/photos/), already delivered as WebP. Used on the site:

- **Hero** ([index.html](index.html), `.hero-media`): `interior-neon-sign.webp` — the dining room with the illuminated "Mông Mơ" sign.
- **Gallery section** (new `#gallery`, between About and Menu): 10 photos in a responsive grid — `dish-noodles-hero.webp`, `interior-bar-lounge.webp`, `dish-buncha-closeup.webp`, `dessert-matcha-tiramisu.webp`, `interior-corner-seating.webp`, `dish-buncha-bowls.webp`, `drink-coffee-flight.webp`, `dish-small-plates.webp`, `dessert-pandan-waffle.webp`, `dish-noodles-drinks.webp`.

The folder also still has the original files (both the "ChatGPT Image …" originals and `image1–6.webp`) plus one extra unused shot (`dish-noodles-flatlay.webp`, a second angle of the noodle dish already used) — kept in case you want to swap something in later; nothing broken by deleting them.

**One caveat on size:** this environment has no image-processing tool available (no ImageMagick/cwebp/PIL), so I placed the WebP files exactly as delivered rather than re-compressing or resizing them — a few run 300–500KB each, which is on the large side for a single photo. All gallery images use `loading="lazy"` so only the hero photo loads immediately; that keeps first-load fast regardless. If you want them trimmed further, running them through [squoosh.app](https://squoosh.app) (quality ~75–80, resize to ~1600px on the long edge) would shave them down noticeably with no visible quality loss.

## 1. Connect the reservation form to email (Formspree)

The site has no backend, so the "Reservierung anfragen" form uses **Formspree** — a free service that receives the form submission and forwards it to a real email address.

1. Go to **https://formspree.io** and create a free account.
2. Create a new form, and set the recipient to the restaurant's Gmail (or whichever inbox should get bookings).
3. Formspree gives you an endpoint URL that looks like:
   `https://formspree.io/f/abcdwxyz`
4. Open [`js/script.js`](js/script.js) and replace the placeholder at the top:

   ```js
   const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
   ```

   with your real endpoint.
5. Formspree will send a confirmation email the first time the form is submitted — click the link to activate it. After that, every reservation request lands directly in the connected inbox with name, email, phone, date, time, party size, and notes.

Free plan covers 50 submissions/month, which is plenty for a small restaurant. Formspree also filters spam automatically; a hidden honeypot field (`_gotcha`) is already built into the form as extra protection.

**Alternative:** if you'd rather not use a third-party service, you can swap the fetch-based submit handler for a plain `mailto:` link — no account needed, but it relies on the customer's device having a mail client configured, and it's a less seamless final step. Ask if you'd like this swapped in instead.

## 2. Fill in the remaining restaurant details

Address, phone, opening hours, rating, and the Google Maps embed are already filled in from the restaurant's real Google Business listing. Two placeholders are still open — search the project for `[` to find them:

| Location in `index.html` | Placeholder | Notes |
|---|---|---|
| Contact section | `[kontakt@mongmo-restaurant.de]` | Real contact email for display (separate from the Formspree booking inbox below) |
| Footer | Instagram / Facebook links (currently `href="#"`) | Add once you have the actual handles — Google only exposed a generic `instagram.com` link, not a specific profile |

Already filled in from the Google Maps listing (Aug 2026): address (Könneritzstraße 46, 04229 Leipzig), phone (0341 60440650), rating (4.8★ / 65 reviews), opening hours (Mi–So 11:00–22:00, Mo & Di Ruhetag), service info (dine-in/takeaway, no delivery, ~10–20€ pp), and a live Google Maps embed + "Route planen" / "Alle Bewertungen ansehen" links pointing at the real listing.

The reservation form's date/time picker now also blocks Monday & Tuesday (closed days) and only allows times from 11:00 onward.

### About the reviews

There's no reliable, free way for a static site to pull live Google review *text* client-side (Google's Places API needs a billed API key and isn't meant to be called straight from the browser, and scraping Maps violates Google's terms). Instead, the Contact section shows the real aggregate rating (4.8★, 65 reviews) with a button linking straight to the restaurant's Google reviews — accurate, zero maintenance, and doesn't risk showing stale or fabricated review text.

If you do want real review snippets embedded on the page later, the practical options are:
- A paid embed widget (e.g. Elfsight, Trustindex, EmbedSocial) that handles the Google API + refresh for you, or
- A small serverless function you control that calls the Google Places API (Place Details → reviews) server-side and caches the result, since the API key must not be exposed in client-side JS.

Happy to wire either of those up if you want to go that route.

## 3. Preview locally

Just open `index.html` in a browser — no server needed. For a closer-to-production preview (so relative paths and any future API calls behave the same as hosted), you can also serve it locally, e.g.:

```bash
npx serve .
```

## 4. Deploy

Any static host works out of the box — no build step required:

- **Netlify / Vercel** — drag-and-drop the folder, or connect a Git repo
- **GitHub Pages** — push to a repo and enable Pages
- Any regular web host — just upload the three files/folders via FTP

## Fonts

Inter and Playfair Display are **self-hosted** in [assets/fonts/](assets/fonts/) rather than loaded from Google's CDN — the page makes zero requests to `fonts.googleapis.com` / `fonts.gstatic.com` (verified: no such requests fire, `document.fonts.check()` confirms both fonts load from the local files). This is faster (no extra DNS/TLS handshake to a third party) and sidesteps the EU/GDPR debate around Google Fonts entirely.

- [assets/fonts/fonts.css](assets/fonts/fonts.css) has the `@font-face` rules; `index.html` links to it directly (no `<link>` to Google anywhere).
- The full set of Unicode subsets from the original Google Fonts request is kept (`latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`, `greek`, `greek-ext`, `vietnamese`), so all 6 site languages render correctly — including the Vietnamese dish names (Phở, Bánh Mì, etc.), which need the `vietnamese` subset specifically.
- To add a new weight or style (e.g. italic), fetch it once from `https://fonts.googleapis.com/css2?family=...` with a modern browser User-Agent (to get `.woff2` URLs), download the referenced files into `assets/fonts/`, and append matching `@font-face` blocks to `fonts.css`.

## Notes on the design

- Colors, typography, and layout are derived from the restaurant's printed menu (sage green background, deep forest green text, cream cards, warm terracotta accent for calls-to-action).
- Fully responsive: single-column mobile layout with a slide-down nav menu, two-column layout from tablet width up.
- No heavy frameworks or images, so it loads fast; the only external requests are the Google Fonts (Fraunces + Inter).
- Menu section is a two-level system matching the full printed menu: five top-level categories (Vorspeisen & Tapas, Hauptspeisen, Mittagskarte, Getränke, Nachtisch), each with their own sub-tabs where needed (e.g. Vorspeisen → Suppen/Snacks/Kleine Häppchen/Kleine Gerichte/Spezialitäten/Zum Teilen; Getränke → Tee & Kaffee/Alkoholfrei/Alkoholisch). Update dishes/prices freely in `index.html` — each item is a small `<article class="menu-item">` block; add or remove them the same way within the relevant `.menu-grid`.
