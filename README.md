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
```

## Editing

**Text** — change it in `index.html` (English) *and* in the matching key in
`assets/js/i18n.js`, or the toggle will put the old wording back.

**Contact form** — set `FORM_ENDPOINT` at the top of `assets/js/main.js` to a
[Formspree](https://formspree.io) endpoint. Empty, it falls back to opening the
visitor's mail client with the message pre-filled.

**Colours and type** — the `:root` block at the top of `style.css`. Everything
else derives from those tokens.

## Local preview

```bash
python3 -m http.server 8000
```

## Deploy

Push to `main`. GitHub Pages serves the root of the branch — no action, no build.
