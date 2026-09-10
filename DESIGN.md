# Portfolio design

## Reference and direction

The current navigation and homepage composition follow the interaction pattern of
[Ansyn](https://ansyn.me/): a round menu trigger, a right-side panel with a curved
entry edge, and large index rows with image previews. The reference was visually
inspected on 10 September 2026. This is our own HTML, CSS and JavaScript; source
code, biography, project assets and branding are not copied. The navy, slate and
teal palette carries forward the earlier Brittany Chiang-inspired portfolio.

## Structure

The homepage has the Think / Build / Ship opening, an interactive Earth section, and eight title-only section links:
About, Work, More projects, AI systems, Experience, Capabilities, Notes, Contact.
There is no permanently visible profile column. Hover or keyboard focus reveals
a preview; fine-pointer movement shifts it within the row. Touch devices show
small static previews and follow each link on the first tap. Use the owner's real
portrait and product media, or clearly illustrative typography/diagrams. Never
invent product screenshots or new factual claims for a preview.

Each index link leads to a real static HTML detail page. About retains the profile,
portrait, availability and languages. Work contains four featured projects and
links to their case studies. More projects retains the five archive entries.
AI systems retains the interactive architecture and baseline sandbox. Experience
retains education, dates, grades, hackathons and references. Capabilities retains
the toolkit. Notes retains all four existing engineering articles. Contact retains
the existing form, links, availability information and four QR codes.

The shared fixed header has a monogram home link, index link and round menu button. Do not repeat the full name in the header; the homepage carries it as a small signature. The
native modal dialog slides from the right, with an animated curved leading edge,
staggered links and a dimmed backdrop. The menu contains all section links,
language controls, social links and the existing visit count. Its interior scrolls
on short screens, with the close control remaining visible. Escape, the close
button and the backdrop dismiss it; focus returns to the trigger. Native modal
behavior contains keyboard focus. Without JS, the index link remains available.

All detail and note pages use the same menu and provide a route back to the index.
Keep all routes directly loadable on GitHub Pages, with no server-side router.
Preserve valid fragment targets when moving content to another page. Detail pages
have one h1 and properly nested subheadings. No Chinese characters appear in copy.

## Tokens

Declare all colours and font sizes in the stylesheet token layer.

- Ground `--paper`: #0F172A; surface `--paper-2`: #17243B.
- Raised / hover ground `--paper-3`: #19263D.
- Primary text `--ink`: #E2E8F0; body `--ink-2`: #A3AFC4.
- Secondary text `--ink-3`: #94A3B8; accent `--signal`: #5EEAD4.
- Accent ground `--signal-ground`: rgba(45,212,191,.10).
- The navy theme is intentional in both system appearances, matching the reference.
- Inter for name, headings and prose; JetBrains Mono for indices and dates.
- Profile name 32–40px fluid, role 20px, body 16px, project prose 14px, meta 12px.
- Spacing tokens: 4, 8, 16, 24, 32, 48, 64, 96, 128px.
- Rounded corners are restrained (6px); pill radius applies only to technology tags.
- Screenshots fill the project width at their natural aspect ratio; never stretch source UI.
- QR tiles always remain white. Preserve real intrinsic media dimensions.

## Motion

Reference-led motion is part of the page: navigation rules extend on focus,
hover or active section; rows gain a subtle surface; project titles and arrows
respond; screenshots zoom gently. Retain staggered scroll entrances, pointer
response on buttons, small image tilt and a restrained pointer spotlight.
Use at most 2px row travel and .4 degree row tilt, 1.5 degree image tilt, 4px
button attraction. Native scrolling, no scroll interception or custom cursor.

Content is visible without JavaScript. Entry animations only begin on intersection
and do not retain animation styles after completion. Batch pointer input in one
requestAnimationFrame and stop rendering while idle. Reset on pointer exit,
scroll, resize, blur and preference changes. Respect prefers-reduced-motion,
cancel in-flight animations and pause video when that setting changes. Ambient animation is limited to the opening and Earth canvases, pauses offscreen or in a hidden tab, and has visible pause controls. Keyboard focus must remain visible and readable.

## Content and accessibility

Preserve dates, contribution counts, ownership, links, references, work-in-progress
status and original meaning. All new/edited strings must have EN and FI copies.
One h1, semantic section h2s, descriptive media alt, first-focusable skip link,
44px links/controls, native form validation, proper language state, no placeholders.
Body/meta contrast >=4.5:1. Screenshots and text must not overflow at 320px.

## Existing integrations

Keep the static GitHub Pages architecture, existing Formspree endpoint, optional
self-hosted analytics, local-preview exclusions, and existing visit counter.
Keep the canonical and social image. Do not add public phone numbers, CV downloads
or third-party reference contact details. Form failure includes a direct email.
No externally hosted runtime scripts. The Earth section uses pinned, locally hosted D3 geographic helpers and TopoJSON with locally stored Natural Earth data. Licenses and versions are included beside the assets. Google Fonts remains in use.

## Verification

Run `python3 tools/design_check.py` and JS syntax checks. Inspect desktop and
mobile, both languages, section navigation, hover/reset and local media loading.
Do not send a real enquiry during testing. Local work does not publish the site.

## Engineering notes and explorer

The JobAI explorer explains four stages: data, forecasting, evaluation and sourced
explanations. It is explicitly an architecture walkthrough, not a live model run.
The evaluation stage includes a browser-only baseline sandbox with explicitly
illustrative quarterly values. A cutoff slider and method selector update the
forecast and absolute error; this is not project evaluation evidence.
Use accessible tabs with arrow/Home/End keys; without JavaScript all panels remain
readable through anchor links. Respect reduced motion when changing stages.

Longer project material belongs on separate static article pages, linked from the
homepage and notes.html. Distinguish implemented functionality, planned work and
unmeasured results. Do not invent benchmark wins or personal design decisions.
Articles and controls have both English and Finnish copy. Featured projects link
to their matching article; notes.html also retains the JobAI research note.

The visit count is visible in the footer on every page. Local previews read the existing total
without incrementing it; the live site counts a session once where sessionStorage
is available. Show an honest unavailable state on errors. This is a session count,
not a measurement of unique people. Leave the existing counter namespace intact.

## Kinetic opening

Think. Build. Ship. is the oversized, three-line headline. English and Finnish
word lengths have separate fluid type scales. The owner's name is a small link
above the headline, alongside the role; the top bar contains only the wy. monogram.

Words enter through a staggered vertical mask. A local Canvas field changes from
an idea-like ring to a cube structure and then flowing signal lines. The active
word and matching process step share a teal accent. Steps can be selected by mouse
or keyboard, which pauses the cycle. A visible pause/resume control covers both
ambient motion and text entrances. Rendering uses a glyph atlas, 30fps cap and
1.5 device pixel ratio, with fewer points on mobile. Pause, an open drawer,
offscreen, hidden-tab and reduced-motion states stop the animation. Reduced motion
retains static typography and allows deliberate step selection. Without JS the
whole heading and process remain visible, with inactive step controls disabled.
The opening footer contains one full-width link to the Earth section; do not add the old AI agents, Search systems or Product delivery shortcuts. Native scrolling leads into the Earth section and then the title index.

## Earth section

An orthographic globe highlights Shanghai, Bangkok and Helsinki, chosen by the
owner. Only Helsinki is described as the current base; no other residence or travel
history is implied. Country outlines come from the local 110m Natural Earth dataset.
City pins use approximate city-centre coordinates and open native detail cards with
time-zone-aware clocks, coordinates and map links. Cards remain usable without JS.

Drag, arrow keys and explicit rotation controls explore the globe. Selecting a city
turns toward it; reset restores a view containing all three cities. Deliberate rotation
pauses ambient motion. Reduced motion disables automatic movement and animated
camera travel. Rendering is capped at 30fps and 1.5 DPR, and pauses with the menu,
offscreen, hidden tab or an open city card (after camera travel completes). Vertical
touch scrolling remains native. Map data loads near the viewport; a geographic SVG
remains visible on failure and without JavaScript. Rebuild it with
`node tools/build_earth_fallback.cjs` after changing geographic data or map colours.

## Linux lab project

The fourth featured project is the owner's self-hosted Linux environment, linked
to homelab.html. Its authentic dashboard image was supplied by the owner and is
captioned as an August 2026 snapshot. Service badges in that image are historical.
Describe third-party applications as software the owner hosts and operates, never
as products they authored. Do not add public links to private administration UIs.

A read-only check on 10 September 2026 established Ubuntu 24.04 LTS, x86-64,
12 logical CPUs and about 31 GiB of usable OS-reported memory through Prometheus.
Grafana, Node Exporter and Prometheus scrape targets were up, and the Coolify login
endpoint responded. This does not establish application-wide uptime, backup
restoration, hardening or alert response. Keep those distinctions in project copy.
