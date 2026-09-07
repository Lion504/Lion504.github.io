# lion504.github.io

Personal site of **Wang Yongzhi** — AI &amp; software engineer, Helsinki.
Live at **https://lion504.github.io**

Hand-built static site. No framework, no build step, no dependencies.

```
index.html              markup + content (EN inline, FI swapped at runtime)
assets/css/style.css    the whole design system
assets/js/i18n.js       EN / FI dictionary — edit copy here
assets/js/main.js       language toggle, nav, scroll reveal, contact form
assets/img/             portrait, OG card, favicon
assets/Wang-Yongzhi-CV.pdf   the downloadable CV (redacted -- see below)
tools/redact_cv.py      strips referee emails out of a freshly exported CV
```

## Editing

**Text** — change it in `index.html` (English) *and* in the matching key in
`assets/js/i18n.js`, or the toggle will put the old wording back.

**Contact form** — set `FORM_ENDPOINT` at the top of `assets/js/main.js` to a
[Formspree](https://formspree.io) endpoint. Empty, it falls back to opening the
visitor's mail client with the message pre-filled.

**Colours and type** — the `:root` block at the top of `style.css`. Everything
else derives from those tokens.

**The CV PDF — do not just copy a new export over it.** The export puts the two
referees' email addresses in the sidebar. This site tells visitors "Contact
details available on request", and publishing those addresses breaks that
promise for two people who are not you. Run the new export through:

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
