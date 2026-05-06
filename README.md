# SRED Financial Inc. — Website

Static marketing/funnel site for SRED Financial Inc., a Canadian SR&ED tax-credit consulting firm. Built as a polished single-page funnel (with supporting About and Contact pages), designed for deployment to GitHub Pages — no backend required.

## Stack

- **HTML / CSS / vanilla JS** — no build step, no framework.
- **Fonts**: Fraunces (display) + Inter (body) via Google Fonts.
- **Lead capture**: Calendly inline embed for booking + Formspree-backed contact form (both placeholders — see "Things to swap before launch" below).
- **Hosting**: GitHub Pages (works as `username.github.io/sred-site` out of the box; supports a custom domain via `CNAME`).

## Structure

```
sred-site/
├── index.html        Long-form sales funnel (hero → problem → solution → process → industries → fees → FAQ → CTA)
├── about.html        Firm philosophy / values
├── contact.html      Calendly embed + contact form
├── 404.html          Not-found page
├── css/styles.css    Design system + components
├── js/main.js        Mobile nav, smooth scroll, form handling
├── assets/
│   ├── logo.svg      Brand mark
│   ├── favicon.svg
│   └── og-image.png  1200×630 social card
├── robots.txt
├── sitemap.xml
└── .nojekyll         Tells GitHub Pages not to run Jekyll
```

## Things to swap before launch

These placeholders need to be replaced with real values once you have them:

1. **Calendly URL** — `contact.html`, search for `calendly.com/sredfinancial/consultation` and replace with your real scheduling URL.
2. **Formspree endpoint** — `contact.html`, search for `formspree.io/f/your-form-id` and replace with the endpoint you get after signing up at [formspree.io](https://formspree.io). Replies route to `rohan@flexsystems.biz` via the form's `_replyto`/`_subject` fields.
3. **Contingency fee percentage** — the homepage `Fees` section shows `[Lower]` as a placeholder for your actual rate. Once you've set your number, replace the `<span class="pct">[Lower]</span>` line in `index.html` (and remove the placeholder note above it).
4. **Canonical domain** — `https://sredfinancial.example/` is used as a placeholder in canonical, OG, and sitemap URLs. Once you have a real domain, run a find-and-replace across the repo.
5. **Email address** — the site routes contact to `rohan@flexsystems.biz`. Update everywhere if that changes.

## Local preview

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Or any other static server (`npx serve`, `live-server`, etc.).

## Deployment to GitHub Pages

1. Create a public repository on GitHub (suggested name: `sred-site`).
2. Push this folder's contents to the `main` branch:
   ```bash
   git remote add origin git@github.com:YOUR-USERNAME/sred-site.git
   git push -u origin main
   ```
3. In the repo on GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch", branch `main`, folder `/` (root). Click Save.
5. Wait ~1–2 minutes — your site will be live at `https://YOUR-USERNAME.github.io/sred-site/`.

### Custom domain (optional)

When you're ready:
1. Add a `CNAME` file at the repo root containing just your domain (e.g. `sredfinancial.ca`).
2. In your DNS provider, add the GitHub Pages records ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. In GitHub repo settings, enter the custom domain under **Pages → Custom domain**.

## Design notes

- **Palette**: deep navy (`#0A2540`) + emerald (`#0E8E6F`) + warm cream (`#FBFAF6`) + gold accent. Designed to read as financial/advisory while staying modern.
- **Type**: Fraunces (variable serif) for display, Inter for body. `display=swap` so text is never invisible while fonts load.
- **Responsive**: tested grid breakpoints at 480, 720, 880, 980, 1180.
- **Accessibility**: skip link, semantic landmarks, focus styles, ARIA labels on the mobile toggle, reduced-motion support.
- **SEO**: per-page titles + meta descriptions, canonical URLs, OG + Twitter cards, JSON-LD ProfessionalService schema, sitemap, robots.

## License

© SRED Financial Inc. — all rights reserved.
