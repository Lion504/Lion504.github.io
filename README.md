# lion504.github.io

Personal site of **Wang Yongzhi** — AI &amp; software engineer, Helsinki.
Live at **https://lion504.github.io**

Hand-built static site. No framework, no build step, no dependencies.

```
DESIGN.md                     how pages on this site are designed — read first
index.html                    markup + content (EN inline, FI swapped at runtime)
assets/css/design-system.css  the token vocabulary DESIGN.md describes
assets/js/i18n.js             EN / FI dictionary — edit copy here
assets/js/main.js             language toggle, nav, scroll reveal, contact form
assets/img/                   portrait, OG card, favicon
tools/design_check.py         mechanically enforces the checkable DESIGN.md rules
tools/redact_cv.py            strips referee emails out of a freshly exported CV
```

## Design

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

**Text** — change it in `index.html` (English) *and* in the matching key in
`assets/js/i18n.js`, or the toggle will put the old wording back.

**Contact form** — set `FORM_ENDPOINT` at the top of `assets/js/main.js` to a
[Formspree](https://formspree.io) endpoint. Empty, it falls back to opening the
visitor's mail client with the message pre-filled.

**Colours and type** — the `:root` block at the top of
`assets/css/design-system.css`. Everything else derives from those tokens, so
change them there rather than anywhere else.

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
