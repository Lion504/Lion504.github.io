# lion504.github.io

Personal site of **Wang Yongzhi** — AI &amp; software engineer, Helsinki.
Live at **https://lion504.github.io**

A hand-built static site in English and Finnish, with no framework.

## Tech

**Front end**
- Semantic HTML5, hand-written CSS with a design-token system (custom properties)
- Vanilla JavaScript: language toggle, scroll and pointer motion, a curved navigation drawer, an accessible screenshot viewer, and an architecture explorer
- Interactive, draggable globe built with D3 (`d3-geo`, `d3-array`), TopoJSON and Natural Earth data, with a static fallback

**Content and search**
- English / Finnish internationalisation, with Finnish pages generated into the markup
- SEO: per-page metadata, `hreflang`, Open Graph, Schema.org JSON-LD (profile, contact, article, breadcrumbs), sitemap, and `llms.txt` for AI assistants

**Quality**
- Accessibility: skip links, keyboard and focus handling, `prefers-reduced-motion`, a print stylesheet
- Python and Node.js build and lint tooling that generates pages and enforces the design rules

**Infrastructure**
- GitHub Pages hosting
- Self-hosted, cookieless [Umami](https://umami.is) analytics with custom events, running in Docker on my own Linux server
- [Formspree](https://formspree.io) contact form with a mail-client fallback

## Credits

The homepage and menu interactions are inspired by [Ansyn](https://ansyn.me/).
The implementation, content and illustrations are my own. D3, TopoJSON and
Natural Earth are used under their licenses, found next to the files in `assets/`.
