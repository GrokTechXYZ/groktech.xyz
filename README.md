# GrokTech

The public site for GrokTech LLC, an independent, hands-on technical consultancy. The Current design uses warm ivory, electric blue, kinetic typography, and a continuous ribbon to express how people and systems connect.

Plain HTML, CSS, and JavaScript. Fonts, artwork, and icons are self-hosted; there is no framework, package installation, build step, analytics dependency, or third-party runtime.

## Local preview

```sh
node scripts/preview.mjs . 4188
```

Open http://localhost:4188. The server binds to loopback and sends uncached responses. The published site is https://groktech.xyz.

## Source

- `index.html`: content, seven service areas, contact destinations, and search/sharing metadata.
- `assets/css/site.css`: responsive compositions, ribbon surfaces, focus states, and reduced-motion styling.
- `assets/js/site.js`: finite animation coordination, service navigation, native-scroll compositions, and clipboard enhancement.
- `404.html`: self-contained error page with absolute asset URLs so nested missing paths remain usable.
- `assets/logo-*.svg`: original GrokTech wordmark geometry.
- `assets/favicon.svg`, `favicon.ico`, `assets/apple-touch-icon.png`: coordinated ribbon icons.
- `assets/og-current.jpg`: 1200 × 630 sharing image. Its editable HTML/SVG source is `scripts/social-card.html`; render that page at 1200 × 630 after local fonts load when changing the sharing design.
- `assets/fonts/`: Archivo and Instrument Serif, with their licenses.
- `robots.txt`, `sitemap.xml`: public discovery information.

## Editing and checks

After changing runtime assets, logos, or icons, refresh the content fingerprints and run the dependency-free checks:

```sh
node scripts/version-assets.mjs
node scripts/check.mjs
```

The checker verifies local asset references and fingerprints, fragment destinations, labels, core service/contact content, structured business metadata, domain configuration, and JavaScript syntax. Browser review is still necessary for layout and interaction changes.

For release verification, exercise narrow phones, short laptops, and wide screens; all seven services; keyboard/touch and browser history; rapid selection changes; live reduced motion and manual pause; no-JavaScript reading and unavailable enhancement APIs. Inspect transitions while moving as well as their settled states.

## Motion and accessibility

Page scrolling stays native. The ribbon changes shape with scroll and service selection; type and copy transition in coordinated finite sequences. There is no perpetual rendering loop. A visible motion control and the operating system's reduced-motion preference stop decorative motion. Hidden and offscreen scenes settle. Keyboard navigation, direct service fragments, and touch share the same content.

Without JavaScript, every service remains readable and booking/email are ordinary links. Clipboard access is optional. No contact details or customer data are stored by the site.

## Deployment

GitHub Pages publishes the repository root from `main`. Keep `.nojekyll` and `CNAME` (`groktech.xyz`) in place. Pushes to `main` trigger the native Pages build and deployment. Verify the build's exact commit, the public HTML and fingerprinted assets, and desktop/mobile rendering before treating a release as complete.

The site links to the existing Calendly and email destinations. Calendar-provider setup is managed separately from this repository.
