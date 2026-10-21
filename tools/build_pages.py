#!/usr/bin/env python3
"""Search metadata and the Finnish copy of the site.

Run after editing any page, assets/js/i18n.js or tools/seo.json:

    python3 tools/build_pages.py

- Rewrites the generated <!-- seo --> block in each English page's <head>:
  title, description, canonical, hreflang, Open Graph and JSON-LD.
- Writes fi/<page>.html with the Finnish strings from i18n.js baked into the
  markup, so search engines and AI crawlers can read the Finnish text.
- Rebuilds sitemap.xml with en/fi alternates.

Needs Node.js only to read i18n.js exactly as the browser does.
"""
import datetime
import json
import re
import subprocess
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://lion504.github.io/"
OG_IMAGE = BASE + "assets/img/og.jpg"
PERSON = {"@type": "Person", "@id": BASE + "#person", "name": "Wang Yongzhi", "url": BASE}
WEBSITE = {"@type": "WebSite", "@id": BASE + "#website", "url": BASE, "name": "Wang Yongzhi"}
START, END = "<!-- seo:start -->", "<!-- seo:end -->"
LOCALE = {"en": "en_US", "fi": "fi_FI"}
PAGE_TYPE = {"home": "ProfilePage", "profile": "ProfilePage", "contact": "ContactPage",
             "collection": "CollectionPage", "page": "WebPage", "article": "WebPage"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
TODAY = datetime.date.today().isoformat()


def load_i18n():
    js = "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.I18N))"
    out = subprocess.run(["node", "-e", js, str(ROOT / "assets/js/i18n.js")],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def page_url(slug, lang):
    prefix = BASE + ("fi/" if lang == "fi" else "")
    return prefix if slug == "index" else prefix + slug + ".html"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def dates(slug):
    name = slug + ".html"
    added = git("log", "--diff-filter=A", "--format=%as", "--", name).split()
    edited = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", name], cwd=ROOT).returncode != 0
    modified = TODAY if edited else git("log", "-1", "--format=%as", "--", name)
    return (added[-1] if added else TODAY), (modified or TODAY)


def sub_once(pattern, repl, text, label):
    out, n = re.subn(pattern, lambda _m: repl, text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"{label}: pattern not found: {pattern}")
    return out


def ld_json(data):
    # "</" would end the script element early.
    return json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")


def structured_data(slug, lang, meta, kind, crumb, home_name):
    url = page_url(slug, lang)
    page = {"@type": PAGE_TYPE[kind], "@id": url + "#webpage", "url": url, "name": meta["title"],
            "description": meta["description"], "inLanguage": lang, "isPartOf": WEBSITE,
            "breadcrumb": {"@id": url + "#breadcrumb"}}
    if kind == "profile":
        page["mainEntity"] = PERSON
    else:
        page["about"] = {"@id": PERSON["@id"]}
    graph = [page, {
        "@type": "BreadcrumbList", "@id": url + "#breadcrumb",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": home_name, "item": page_url("index", lang)},
            {"@type": "ListItem", "position": 2, "name": crumb, "item": url},
        ]}]
    if kind == "article":
        published, modified = dates(slug)
        graph.append({"@type": "TechArticle", "@id": url + "#article", "headline": crumb,
                      "description": meta["description"], "url": url, "inLanguage": lang,
                      "image": OG_IMAGE, "datePublished": published, "dateModified": modified,
                      "author": PERSON, "mainEntityOfPage": {"@id": url + "#webpage"}})
    return {"@context": "https://schema.org", "@graph": graph}


def seo_block(slug, lang, meta, kind, crumb, home_name):
    other = "en" if lang == "fi" else "fi"
    og_type = {"home": "profile", "article": "article"}.get(kind, "website")
    attr = lambda s: escape(s, quote=True)
    lines = [
        START,
        f'<link href="{page_url(slug, "en")}" hreflang="en" rel="alternate"/>',
        f'<link href="{page_url(slug, "fi")}" hreflang="fi" rel="alternate"/>',
        f'<link href="{page_url(slug, "en")}" hreflang="x-default" rel="alternate"/>',
        f'<meta content="{og_type}" property="og:type"/>',
        '<meta content="Wang Yongzhi" property="og:site_name"/>',
        f'<meta content="{attr(meta["title"])}" property="og:title"/>',
        f'<meta content="{attr(meta["description"])}" property="og:description"/>',
        f'<meta content="{page_url(slug, lang)}" property="og:url"/>',
        f'<meta content="{OG_IMAGE}" property="og:image"/>',
        f'<meta content="{LOCALE[lang]}" property="og:locale"/>',
        f'<meta content="{LOCALE[other]}" property="og:locale:alternate"/>',
        '<meta content="summary_large_image" name="twitter:card"/>',
    ]
    if kind != "home":  # the homepage keeps its hand-written ProfilePage/Person data
        data = structured_data(slug, lang, meta, kind, crumb, home_name)
        lines.append(f'<script type="application/ld+json">\n{ld_json(data)}\n</script>')
    lines.append(END)
    return "\n".join(lines)


def set_head(html, slug, lang, meta, kind, crumb, home_name):
    # The block is inserted as canonical + "\n" + block, so remove that newline with it.
    html = re.sub(r"\n?" + re.escape(START) + r".*?" + re.escape(END), "", html, flags=re.S)
    html = re.sub(r'<meta content="[^"]*" property="og:[^"]+"/>\n?', "", html)
    html = re.sub(r'<meta content="[^"]*" name="twitter:[^"]+"/>\n?', "", html)
    html = re.sub(r'<link href="[^"]*" hreflang="[^"]+" rel="alternate"/>\n?', "", html)
    html = sub_once(r"<title>.*?</title>", f"<title>{escape(meta['title'], quote=False)}</title>", html, slug)
    html = sub_once(r'<meta content="[^"]*" name="description"/>',
                    f'<meta content="{escape(meta["description"], quote=True)}" name="description"/>', html, slug)
    canonical = f'<link href="{page_url(slug, lang)}" rel="canonical"/>'
    return sub_once(r'<link href="[^"]*" rel="canonical"/>',
                    canonical + "\n" + seo_block(slug, lang, meta, kind, crumb, home_name), html, slug)


def close_of(html, tag, start):
    """Index of the closing tag that balances an element opened just before `start`."""
    depth, pos = 1, start
    pattern = re.compile(r"<(/?)%s\b[^>]*>" % re.escape(tag), re.I)
    while depth:
        m = pattern.search(html, pos)
        if not m:
            raise SystemExit(f"unbalanced <{tag}> after offset {start}")
        depth += -1 if m.group(1) else 1
        pos = m.end()
    return m.start()


def apply_dict(html, strings):
    """Bake i18n strings into the markup the way applyLang() does with innerHTML."""
    opening = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>')
    pos = 0
    while True:
        m = opening.search(html, pos)
        if not m:
            return html
        tag, key = m.group(1).lower(), m.group(2)
        value = strings.get(key)
        if tag in VOID or not isinstance(value, str):
            pos = m.end()
            continue
        end = close_of(html, tag, m.end())
        html = html[:m.end()] + value + html[end:]
        pos = m.end() + len(value)


def to_finnish(html, strings, slug):
    html = sub_once(r'<html lang="en">', '<html lang="fi">', html, slug)
    html = apply_dict(html, strings)
    # Pages live one level down, so relative asset paths need ../
    html = re.sub(r'(\s(?:href|src|poster)=")assets/', r"\1../assets/", html)
    html = html.replace(
        '<button aria-pressed="true" class="lang__btn is-active" data-lang="en" type="button">EN</button>',
        '<button aria-pressed="false" class="lang__btn" data-lang="en" type="button">EN</button>').replace(
        '<button aria-pressed="false" class="lang__btn" data-lang="fi" type="button">FI</button>',
        '<button aria-pressed="true" class="lang__btn is-active" data-lang="fi" type="button">FI</button>')
    if slug == "index":
        m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', html, re.S)
        data = json.loads(m.group(2))
        data["url"] = page_url("index", "fi")
        data["inLanguage"] = "fi"
        html = html[:m.start(2)] + "\n" + ld_json(data) + "\n" + html[m.end(2):]
    return html


def write_if_changed(path, text):
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old != text:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    return old != text


def build():
    i18n = load_i18n()
    seo = json.loads((ROOT / "tools/seo.json").read_text(encoding="utf-8"))["pages"]
    sitemap = ROOT / "sitemap.xml"
    old_lastmod = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>",
                                  sitemap.read_text(encoding="utf-8")))
    entries = []
    for slug, cfg in seo.items():
        src = ROOT / f"{slug}.html"
        english = src.read_text(encoding="utf-8")
        key = re.search(r'<body[^>]*data-title-key="([^"]+)"', english)
        crumb = lambda lang: i18n[lang][key.group(1)] if key else ""
        home = lambda lang: i18n[lang]["menu.home"]
        english = set_head(english, slug, "en", cfg["en"], cfg["type"], crumb("en"), home("en"))
        finnish = set_head(to_finnish(english, i18n["fi"], slug), slug, "fi", cfg["fi"],
                           cfg["type"], crumb("fi"), home("fi"))
        for lang, path, text in (("en", src, english), ("fi", ROOT / "fi" / f"{slug}.html", finnish)):
            loc = page_url(slug, lang)
            changed = write_if_changed(path, text)
            entries.append((slug, loc, TODAY if changed else old_lastmod.get(loc, TODAY)))
            print(f"{'wrote' if changed else 'kept '} {path.relative_to(ROOT)}")
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for slug, loc, lastmod in entries:
        lines += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{lastmod}</lastmod>"]
        for hreflang, lang in (("en", "en"), ("fi", "fi"), ("x-default", "en")):
            lines.append(f'    <xhtml:link rel="alternate" hreflang="{hreflang}" href="{page_url(slug, lang)}"/>')
        lines.append("  </url>")
    lines.append("</urlset>")
    print(("wrote" if write_if_changed(sitemap, "\n".join(lines) + "\n") else "kept ") + " sitemap.xml")


if __name__ == "__main__":
    build()
