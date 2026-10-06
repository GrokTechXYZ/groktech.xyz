# groktech.xyz

The GrokTech site. One hand-built page: no framework, no build step, no page-builder subscription.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The whole page. All the copy lives here. |
| `404.html` | Shown by GitHub Pages for any missing URL. Self-contained on purpose. |
| `assets/css/site.css` | Styles. Colors, fonts and spacing are variables in the `:root` block at the top. |
| `assets/js/site.js` | The live globe, the Range hover links, and copy-to-clipboard. The page works without it. |
| `assets/fonts/` | Archivo and Instrument Serif, self-hosted so visitors never hit Google. |
| `assets/logo.svg` | The GROKTECH wordmark and arc, traced from the original logo PNG. |
| `assets/favicon.svg` | The G and arc mark. `favicon.ico` and `assets/apple-touch-icon.png` are PNG copies of it. |
| `assets/og-image.jpg` | The preview card that shows up when someone shares the link. |
| `CNAME` | Tells GitHub Pages to serve the site at groktech.xyz. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a public repo (for example `groktech.xyz`) and push this folder to its `main` branch.
2. In the repo, go to **Settings > Pages**. Under **Build and deployment**, pick **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The custom domain fills in from the `CNAME` file. If it doesn't, enter `groktech.xyz`.
4. Point the domain at GitHub wherever its DNS is managed:
   - `A` records for `groktech.xyz`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records (optional, for IPv6): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record for `www`: `<your-github-username>.github.io`

   Where to make these changes: groktech.xyz is registered at GoDaddy, but its nameservers point to Migadu (as of October 2026), so the records live in Migadu's DNS settings. Edits in GoDaddy's DNS panel won't take effect while the nameservers point to Migadu.

   Change only these records. Leave the `MX` and `TXT` records alone: they carry `contact@groktech.xyz`, and deleting them stops your email. If you move the domain to a new DNS provider or registrar, copy those records over before you switch.
5. When GitHub shows the certificate is ready, tick **Enforce HTTPS**.
6. Recommended: verify the domain under your GitHub account's **Settings > Pages > Verified domains**, so no one else can point a Pages site at it.

Keep the Canva site running until the new one loads on your domain, then cancel. The domain is registered at GoDaddy, so cancelling Canva doesn't affect it.

Want to look at it on `github.io` before switching DNS? Delete `CNAME` (or clear the custom domain in Settings) while you test. Otherwise GitHub will redirect to groktech.xyz, which still points at Canva.

## Editing

- **Copy:** `index.html`. Search for the sentence you want to change and edit it in place.
- **Colors:** the `:root` block at the top of `assets/css/site.css`. Navy `#1d2549` and lime `#bdf347` come from the original site.
- **Contact details:** the email address (`contact@groktech.xyz`) and Calendly link appear in the hero, the contact section and the footer of `index.html`, plus the business details block in its `<head>`.
- **Preview card:** `assets/og-image.jpg` (1200 x 630) uses the current headline. Replace it if the headline changes.

## Credits

Fonts: Archivo by Omnibus-Type and Instrument Serif by Instrument, both under the SIL Open Font License 1.1. See `assets/fonts/LICENSE.md`.
