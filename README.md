# lion504.github.io

Version **2.0.0** · [Release history](CHANGELOG.md)

Personal site of **Wang Yongzhi** — AI &amp; software engineer, Helsinki.
Live at **https://lion504.github.io**

Hand-built static site. No framework or build step. The globe uses pinned geographic helpers and map data hosted with the site.

```
DESIGN.md                     how pages on this site are designed — read first
index.html                    Think / Build / Ship opening + interactive globe + title index
about.html / work.html / projects.html  profile, featured projects and project archive
ai-systems.html / experience.html / capabilities.html  full section details
contact.html                  contact form, links and QR codes
assets/css/design-system.css  the token vocabulary DESIGN.md describes
assets/js/i18n.js             EN / FI dictionary — edit copy here
assets/js/main.js             language toggle, project video, contact form
assets/js/motion.js           scroll entrances, pointer effects, reading progress
assets/js/navigation.js       curved modal drawer and title preview interactions
assets/js/kinetic.js          three-phase animated process and typography opening
assets/js/earth.js            draggable globe, location cards and local clocks
assets/js/vendor/             pinned D3 geographic helpers and TopoJSON, with licenses
assets/data/                  local Natural Earth country data and attribution
tools/build_earth_fallback.cjs  regenerates the static globe fallback
assets/js/explore.js          accessible JobAI architecture explorer
assets/js/gallery.js          full-size screenshot viewer and focus restoration
homelab.html                 self-hosted Ubuntu environment and monitoring evidence
notes.html                   engineering notes index
jobai-evaluation.html        evaluation and data provenance note
jobsresearch-decisions.html  matching and applicant workflow note
clboost-beyond-generation.html  generation, editing and localization note
fijobmaps-data.html           Finnish data pipeline, provenance and treemap decisions
assets/img/                   portrait, OG card, favicon
tools/design_check.py         mechanically enforces the checkable DESIGN.md rules
tools/make_qr.py              regenerates the contact QR codes (needs `segno`)
tools/redact_cv.py            strips referee emails out of a freshly exported CV
```

## Design

The homepage and menu interactions are inspired by [Ansyn](https://ansyn.me/):
a round trigger opens a curved sliding drawer; section titles reveal images on
hover/focus and link to dedicated pages. The navy/slate palette and teal accents
carry forward the earlier Brittany Chiang-inspired design. Implementation,
content and illustrative preview diagrams are our own.

`DESIGN.md` is the guidance file for this site — brand voice, information
architecture, the token and component vocabulary, and the anti-patterns to
refuse. It is published at <https://lion504.github.io/DESIGN.md> so it can be
handed to an agent alongside the stylesheet URL.

Before publishing a change, run the checks:

```bash
python3 tools/design_check.py
```

A non-zero exit means the page is not ready. Fix the page, not the check —
unless the rule itself was wrong, in which case change `DESIGN.md` first and let
the check follow.

## Editing

**Text** — change it in the relevant HTML page (English) *and* in the matching key in
`assets/js/i18n.js`, or the toggle will put the old wording back.

**Contact form** — posts to the [Formspree](https://formspree.io) endpoint in
`FORM_ENDPOINT` at the top of `assets/js/main.js`, which forwards to the address
in `EMAIL`. The free tier allows 50 submissions a month; past that Formspree
rejects them and the form shows the email address as a fallback link. Clear
`FORM_ENDPOINT` to `''` and the form reverts to opening the visitor's own mail
client instead. Keep reCAPTCHA off in the Formspree form settings — the
submission is a background `fetch`, so a challenge has nowhere to render.

**Colours and type** — the `:root` block at the top of
`assets/css/design-system.css`. Everything else derives from those tokens, so
change them there rather than anywhere else.

## Visit counter

The footer count comes from [abacus](https://abacus.jasoncameron.dev) — free, no
signup, no cookies. The namespace and key are in the `visits` block of
`assets/js/main.js`; changing the key starts a fresh count, and deleting the
block removes the feature cleanly.

It counts once per browser session when sessionStorage is available. Local previews
use the read-only `/get/` endpoint and label the total as excluding the preview.
The count is visible at the end of every page, with an explicit unavailable state on timeout
or errors. It measures sessions rather than unique people.

## Analytics

Self-hosted [Umami](https://umami.is) — cookieless, no third party, and the
data stays on your own server. Nothing loads until `ANALYTICS_HOST` and
`ANALYTICS_ID` are both set at the top of `assets/js/main.js`, and the script is
never injected on `localhost`, so local previews are not counted.

**It must be served over HTTPS.** This site is HTTPS, so a script from an
`http://` host is blocked as mixed content and you will silently get no data. A
bare IP will not do — give the instance a domain and let Coolify issue the
certificate.

Coolify: **New Resource → Umami** (one-click; it provisions PostgreSQL too),
give it a subdomain, then log in with `admin` / `umami` and change the password
immediately. Without Coolify:

```yaml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: change-me
    depends_on: [db]
    ports: ["3000:3000"]
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes: [umami-db:/var/lib/postgresql/data]
volumes:
  umami-db:
```

Then in Umami: **Settings → Websites → Add**, domain `lion504.github.io`. It
gives you a website ID — that and the instance URL are the two values above.

To keep your own visits out of the numbers, run this once in the browser
console on the live site:

```js
localStorage.setItem('umami.disabled', 1)
```

Some ad blockers block any script named `script.js` from a host called
`analytics.*`. If your own visits vanish entirely, that is usually why — Umami
lets you serve the script under a different name.

**The CV PDF is not published on this site.** If you decide to publish one in
future, run a new export through the redaction tool first:

```bash
pip install pypdf
python3 tools/redact_cv.py ~/Downloads/<new-export>.pdf
```

It removes the glyphs rather than covering them — a black box over PDF text
leaves the text extractable underneath. Then verify, and do not skip this:

```bash
pdftotext -layout assets/Wang-Yongzhi-CV.pdf - | grep -i 'metropolia.fi'
```

Nothing should come back. The script exits non-zero if it finds none of its
targets, so a changed export fails loudly instead of shipping unredacted.

## Local preview

```bash
python3 -m http.server 8000
```

## Deploy

Push to `main`. GitHub Pages serves the root of the branch — no action, no build.

## Featured projects

JobsResearch, CLboost, Fi-Job-Maps and the self-hosted Linux lab are the four featured projects. Other projects remain in
five native expandable archive rows. Larger explanations live on separate
engineering-note pages; preserve evidence, contribution context and source links
when updating them. CLboost's recording has manual playback controls. Screenshot
links open a full-size dialog with JavaScript and the original image without it.
