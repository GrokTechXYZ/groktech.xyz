# GrokTech / Parallax

A continuous spatial experience for an independent, hands-on technologist. The page connects perception, complete IT systems, public contributions and a direct invitation. GrokTech is the public identity. No personal aliases, employment chronology or life story.

## Design

Parallax shows how a change of perspective makes relationships visible. Three translucent architectural apertures hold fine engraved contours. The opening presents them obliquely, as separate depths. Each depth contains only one third of an engraved frame and a separate fragment of a signal. At Perception the camera squares to the work, the engravings complete the frame and the separated signal endpoints align into one unbroken route. Practice separates the same planes into a working stack. At Work the same aperture widens to the measured bounds of each real project window, trading abstraction for evidence. It then reopens as a warm frame beside the invitation.

Transitions have explicit thresholds near section boundaries. Long reading sections hold a composed state. A single object carries across every scene rather than replacing one decorative effect with another. The same rounded aperture opens into the actual project previews. Focusing or hovering a service softly emphasizes its corresponding hardware, network or software plane. Native scrolling controls the camera. Fine-pointer movement introduces a slight change of viewpoint, then all drawing stops when settled. No scroll capture, timeline, autoplay loop or required interaction.

The bright ivory, slate, blue and champagne palette, typography and business details stay consistent with the published site. The canvas stays beneath readable content. A matching SVG aperture remains when JavaScript or canvas is unavailable. A persistent manual pause and OS reduced motion replace the moving canvas with a quiet static engraving, so a project-bound frame cannot remain over unrelated copy. Re-enabling motion refreshes layout measurements before revealing the canvas. Resizing and disclosures also refresh section measurements.

Sound remains optional and off on load. The existing original synthesized chords are enabled only by an explicit click and stop when the tab is hidden. The artwork does not require sound.

## Deployment and preview

GitHub Pages serves this buildless site from the repository root on `main`, with the custom domain `groktech.xyz` and HTTPS enforced.

For local review run `node scripts/preview.mjs . 4197`. Private cross-device previews use Tailscale Serve to forward HTTPS to this loopback server. Keep host-specific preview addresses in local task notes. The selected Parallax experience is published from the main branch through GitHub Pages.

After a release, verify the GitHub Pages deployment for the exact commit, compare served assets with the source, and check the live desktop and phone layouts.

## Content

Use first person and no em dashes. No invented region, response promise, clients, certification or outcomes. The owner sources racks and hardware, mounts and cables servers, designs redundant networks and failover, configures virtualization, builds software and automates operations.

The owner is based in Wekiwa Springs, Central Florida, and wants to reach clients in Longwood. Keep the real home base distinct from the service area in visible copy and metadata. The audience includes individuals, small businesses and corporate teams. Do not imply a Longwood office, a fixed service radius, walk-in hours or a response-time promise.

The proof line retains owner-confirmed 21 years in IT, historical 99.99% uptime and experience meeting CMMC Level 2 and ISO 27001 requirements. These are not a future uptime guarantee or an independent certification claim.

Tezos Systems was built for the community. Its image shows the Valley theme with resolved data. Tez Capital is a collaboration between Berry Studio and GrokTech, building and maintaining TezBake, TezPay, TezGov, TezWatch and TezSign, with documentation, support and communications since 2021. Public project images are snapshots, not live dashboards.

The opening connects “I look between the lines” to “You can start with one line.” Chat is the immediate invitation; booking at https://calendly.com/groktech and email at contact@groktech.xyz remain visible alternatives in the opening and at the end. The closing note, “The next line is yours,” points to the same smiling launcher. Optional clipboard controls announce success or select the email when automatic copy fails. Service details remain native, keyboard-accessible disclosures with direct hash links.

## Verification

Buildless HTML, CSS and JavaScript. Bubblegram is the only external script; the page and existing contact links work independently of it. After asset edits run `node scripts/version-assets.mjs`, then `node scripts/check.mjs`. Review all five scenes at desktop and phone sizes, shorter laptop viewports, keyboard, service hash links, clipboard, sound opt-in and cleanup, motion pause, live reduced-motion changes, canvas failure and no JavaScript. Verify served HTML and asset bytes over the tailnet before handoff.

## Live chat

`index.html` loads Bubblegram's async CDN script immediately before `</body>`, with the project's public key inline. There is no package, component, build step or private credential. Telegram routing and availability messages are managed in Bubblegram. The install guide is https://bubblegram.co/docs/embed-widget.md.

`assets/js/chat.js` progressively enhances the native launcher with a smiling speech bubble, a desktop invitation, keyboard state and Escape dismissal. `assets/css/chat.css` is preloaded and added to the widget's open shadow root, matching the site palette and respecting reduced motion and the site's pause control. The native click handler and unread badge are preserved. These enhancements depend on the vendor's current DOM selectors and open/closed state classes. Missing required elements skip enhancement and preserve the standard widget; state-class changes still require an integration update. Recheck after upstream widget changes. Sound and motion controls sit bottom-left to leave chat bottom-right.

Before release, check the launcher after reload, open/close and keyboard focus, desktop and phone layouts, and delivery to/from the linked Telegram group. Loading the launcher alone does not verify Telegram delivery. Attachment availability depends on the Bubblegram plan.

The hero, practice invitation and closing note use `data-chat-open` links. When the widget is available they call the documented `Bubblegram.open()` method; they remain ordinary email links otherwise. Hover or keyboard focus quietly outlines the fixed launcher, and closing chat returns focus to the invitation used. The empty chat panel carries the same first-person welcome. `assets/css/conversation.css` styles these page invitations, and `assets/chat-smile.svg` echoes the native launcher's face without adding a second floating control.

## Local search pages

The homepage links to four static pages, all editable directly without a build:

- `/longwood-it-consulting/`: local service overview, audiences, engagement process and practical questions.
- `/services/it-infrastructure/`: hardware, servers, networking, virtualization, failover and operations.
- `/services/software-integrations/`: custom software, APIs, internal tools and public project evidence.
- `/services/business-automation/`: connected workflows, data handoffs and operational automation.

The pages use `assets/css/service-pages.css`, the existing fonts and palette, and the same chat, email and booking destinations. Content and navigation work without JavaScript. Only the homepage loads the spatial artwork and sound scripts. Preserve the homepage's five-scene structure when adding links or text.

Every indexable page has its own title, description, canonical URL and social metadata. JSON-LD identifies the same Organization and WebSite across pages; service pages add Service, WebPage and visible BreadcrumbList information. Wekiwa Springs is the business locality and Longwood is a service area. Organization markup is deliberate: there is no verified public street address to supply for Google's LocalBusiness rich-result requirements. Do not add invented addresses, phone numbers, ratings, reviews or certifications. FAQ answers are visible HTML, without a promise of FAQ rich results.

`scripts/html-files.mjs` discovers nested public HTML for asset fingerprinting and validation. After edits, run `node scripts/version-assets.mjs` and `node scripts/check.mjs`. Checks cover cross-page fragments, local assets, unique metadata, canonical URLs, structured-data consistency and sitemap coverage. Update sitemap `lastmod` when page content changes. Public project descriptions use existing evidence; new client case studies require real details and permission to publish them.

## Google setup for the owner

The site changes are the website portion of local discovery. Google account ownership, profile verification, indexing and customer reviews are separate steps. These instructions do not mean those steps have been completed. Publish and verify the new pages before submitting their URLs to Google.

1. **Claim an existing Google Business Profile, or create one if none exists.** Search for GrokTech first to avoid duplicates. Use the Google account you intend to retain as the owner. Keep the real business name, GrokTech; do not append search keywords or a city to the business name. Start at <https://business.google.com/>.
2. **Use the correct business model.** Google requires in-person contact with customers. If you visit clients and do not receive customers at your base, use a service-area profile with Longwood as a genuine service area and keep the base address off the public listing. Give Google the real address for verification when requested. Remote-only businesses are not eligible. Do not claim a Longwood storefront unless one actually exists. Follow the verification method Google offers; the owner may need to complete a video or other verification personally.
3. **Complete the profile.** Select the closest available primary category for the work you most want to be hired for; consider Computer consultant if Google offers it and it accurately fits. Add only relevant secondary categories. Include IT infrastructure, networking, server installation, software integrations and business automation in Services. Add a business phone if you have one, accurate contact hours, a logo and genuine work photos you are allowed to share. Use `https://groktech.xyz/longwood-it-consulting/` as the website once published. Link `https://calendly.com/groktech` if an appointment field is available.
4. **Verify Search Console.** At <https://search.google.com/search-console/>, add the Domain property `groktech.xyz` and add the exact TXT record Google provides at your DNS provider. If you prefer not to change DNS, a URL-prefix property for `https://groktech.xyz/` can use one of Google's offered verification methods. Verification tokens must come from your account; none have been invented or embedded in this repository.
5. **Submit and inspect.** Submit `https://groktech.xyz/sitemap.xml` in Search Console. Use URL Inspection on the homepage and each new page; check the live test, rendered content and selected canonical, and request indexing after publication. Submission does not guarantee indexing or ranking.
6. **Ask clients for honest reviews.** Use the review link from your verified Business Profile after completed work. Ask consistently, without incentives or filtering requests to only positive experiences. Reply professionally. Add real case studies to the site as approved details become available.
7. **Measure useful inquiries.** Check Search Console queries and landing pages, and Business Profile performance. Record how new inquiries found you and whether they became relevant conversations or projects. No analytics account or tracking script is configured by these site changes. Bookings, completed chat conversations and email inquiries are more useful than page views alone.

Suggested Business Profile description, to review and paste after eligibility and verification are established:

> GrokTech provides independent, hands-on technology consulting for individuals, businesses and corporate teams in Longwood and Central Florida. Based in Wekiwa Springs, I work across IT infrastructure, servers, networking, virtualization, custom software, API integrations and business automation. From an isolated technical problem to a connected system, you work directly with the person doing the work.

Official guidance checked October 13, 2026:

- Business eligibility: <https://support.google.com/business/answer/13763036>
- Service areas and public address handling: <https://support.google.com/business/answer/9157481>
- Local ranking factors: <https://support.google.com/business/answer/7091>
- Verification: <https://support.google.com/business/answer/7107242>
- Search Console ownership verification: <https://support.google.com/webmasters/answer/9008080>
- URL Inspection and indexing: <https://support.google.com/webmasters/answer/9012289>
- Organization markup: <https://developers.google.com/search/docs/appearance/structured-data/organization>
- Google review guidance: <https://support.google.com/business/answer/3474122>
