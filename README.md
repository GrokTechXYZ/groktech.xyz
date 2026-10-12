# GrokTech — Current

An independent local design study on `primate/current`. The existing GrokTech wordmark, consultant positioning, seven areas of work, four-step approach, contact address and Calendly destination are preserved.

Current uses an ivory editorial canvas and a substantial electric-blue ribbon as its visual language. The ribbon arrives with the headline, bends as the visitor scrolls, and changes its shape with each service selection. A separate directional wipe introduces service copy while the sculpture stays visible. The rest of the page carries the movement through layered rings, a drawing process path and travelling contact typography.

## Preview

From this checkout:

```sh
node scripts/preview.mjs . 4188
```

Open `http://localhost:4188/`. The server binds to loopback only. There is no build step and no external runtime dependency.

## Motion and interaction

- The opening composition settles within 1.7 seconds.
- Native page scrolling changes ribbon control points, headline position, statement rings, the process drawing and contact type. There is no scroll interception or long pinned spacer.
- Seven service selections share one SVG sculpture. Each transition morphs its two cubic curves over 1.45 seconds, moves the active index marker, masks the heading and carries a blue wipe across the copy pane. Text moves without scaling.
- The service row uses progressively enhanced anchors with tab semantics, arrow-key navigation, Home/End and explicit previous/next buttons. On phones the index row scrolls independently in its horizontal direction; the page retains native vertical scrolling.
- Rapid selections cancel previous animations and immediately select the latest requested content.
- The footer motion control pauses all effects. A live operating-system reduced-motion change cancels running Web Animations and animation frames, and settles the current content. Manual pause survives OS preference changes.
- The ribbon morph stops when its service stage leaves the viewport. Hidden documents cancel active animation. Scrolling schedules a single frame; there is no idle rendering loop.
- Without JavaScript, all seven service descriptions are visible and their index anchors still work. Copy and motion controls remain hidden; contact links continue working.

## Local verification

Chromium rendering checked at 320, 390, 768, 1024, 1440 and 1920 pixels with no horizontal page overflow or page errors. Every service panel was checked for clipping at 320, 390, 768 and 1440 pixels. Keyboard Home/End, fast repeated selection, clipboard feedback, mid-transition reduced motion, manual pause persistence and the no-JavaScript fallback passed. The ribbon transition was visually inspected at 400 ms, 900 ms and settled state, then refined so the wipe never hides the sculpture's motion. Phone ribbon placement and desktop headline contrast were also refined after rendering.

Assets are local. No production deployment is performed by this branch.
