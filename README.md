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

The proof line retains owner-confirmed 21 years in IT, historical 99.99% uptime and experience meeting CMMC Level 2 and ISO 27001 requirements. These are not a future uptime guarantee or an independent certification claim.

Tezos Systems was built for the community. Its image shows the Valley theme with resolved data. Tez Capital is a collaboration between Berry Studio and GrokTech, building and maintaining TezBake, TezPay, TezGov, TezWatch and TezSign, with documentation, support and communications since 2021. Public project images are snapshots, not live dashboards.

Primary contact is https://calendly.com/groktech. The fallback is the plain email link groktechllc@gmail.com. Both appear in the opening and at the end. Optional clipboard controls announce success or select the email when automatic copy fails. Service details remain native, keyboard-accessible disclosures with direct hash links.

## Verification

Buildless HTML, CSS and JavaScript. No external runtime dependencies. After asset edits run `node scripts/version-assets.mjs`, then `node scripts/check.mjs`. Review all five scenes at desktop and phone sizes, shorter laptop viewports, keyboard, service hash links, clipboard, sound opt-in and cleanup, motion pause, live reduced-motion changes, canvas failure and no JavaScript. Verify served HTML and asset bytes over the tailnet before handoff.
