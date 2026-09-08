#!/usr/bin/env python3
"""Deterministic checks for DESIGN.md.

Enforces only the rules that can be checked without judgement. Everything
judgement-based stays prose in DESIGN.md and is caught in review.

    python3 tools/design_check.py [page.html ...]

Exits non-zero if any page fails.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STYLESHEET = ROOT / "assets" / "css" / "design-system.css"

# DESIGN.md §4 — the only spacing values that exist.
SPACING_SCALE = {"0", "4px", "8px", "16px", "24px", "32px", "48px", "64px", "96px", "128px"}

# DESIGN.md §1 and §8 — words that never survive review.
BANNED_WORDS = [
    "passionate", "cutting-edge", "cutting edge", "innovative", "leveraging",
    "seamless", "world-class", "revolutionary", "10x", "synergy",
    "excited to share", "game-changing", "lorem ipsum", "currently learning",
]

EMOJI = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF✨⭐]"
)


class Page(HTMLParser):
    """Collects only what the checks below need."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.headings = []          # (level, text)
        self.images = []            # attr dicts
        self.hrefs = []
        self.i18n_keys = []
        self.inline_styles = []
        self.first_focusable = None
        self.has_main = False
        self.lang = None
        self._heading = None
        self.text = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._heading = (int(tag[1]), [])
        if tag in ("img", "video"):
            self.images.append((tag, a))
        if tag == "a":
            self.hrefs.append(a.get("href", ""))
            if self.first_focusable is None:
                self.first_focusable = a
        if tag in ("button", "input", "textarea", "select") and self.first_focusable is None:
            self.first_focusable = a
        if a.get("id") == "main":
            self.has_main = True
        if "data-i18n" in a:
            self.i18n_keys.append(a["data-i18n"])
        if "style" in a:
            self.inline_styles.append((tag, a["style"]))

    def handle_endtag(self, tag):
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self._heading:
            self.headings.append((self._heading[0], "".join(self._heading[1]).strip()))
            self._heading = None

    def handle_data(self, data):
        self.text.append(data)
        if self._heading:
            self._heading[1].append(data)


def i18n_dictionaries():
    """Parse the top-level keys of each dictionary in assets/js/i18n.js."""
    src = (ROOT / "assets" / "js" / "i18n.js").read_text(encoding="utf-8")
    dicts = {}
    for lang in ("en", "fi"):
        m = re.search(r"\b%s\s*:\s*\{" % lang, src)
        if not m:
            continue
        i, depth = m.end() - 1, 0
        while i < len(src):
            if src[i] == "{":
                depth += 1
            elif src[i] == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        body = src[m.end():i]
        dicts[lang] = set(re.findall(r"""['"]([\w.\-_]+)['"]\s*:""", body))
    return dicts


def check_stylesheet(fail):
    css = STYLESHEET.read_text(encoding="utf-8")
    # Every :root block is token definition — light, dark, or any future theme.
    body = re.sub(r":root\s*\{[^}]*\}", "", css)

    for m in re.finditer(r"font-size\s*:\s*([^;]+);", body):
        value = m.group(1).strip()
        if not value.startswith("var(") and "em" not in value and not value.startswith("clamp"):
            fail(STYLESHEET.name, f"raw font-size outside the token layer: {value}")

    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", body):
        fail(STYLESHEET.name, f"hard-coded colour outside the token layer: {m.group(0)}")

    for m in re.finditer(r"(?:margin|padding|gap)[a-z-]*\s*:\s*([^;{]+);", body):
        for token in m.group(1).split():
            if re.fullmatch(r"-?\d+px", token) and token not in SPACING_SCALE:
                fail(STYLESHEET.name, f"spacing value off the scale: {token}")


def check_page(path, dicts, fail):
    raw = path.read_text(encoding="utf-8")
    page = Page()
    page.feed(raw)
    name = path.name
    text = "".join(page.text)

    # §7 — one h1, no skipped levels
    h1s = [h for h in page.headings if h[0] == 1]
    if len(h1s) != 1:
        fail(name, f"expected exactly one h1, found {len(h1s)}")
    prev = 0
    for level, title in page.headings:
        if prev and level > prev + 1:
            fail(name, f"heading level skips h{prev} -> h{level} at {title!r}")
        prev = level

    # §7 — alt text and dimensions on media
    for tag, a in page.images:
        label = a.get("alt") if tag == "img" else a.get("aria-label")
        if not (label or "").strip():
            fail(name, f"<{tag} src={a.get('src')}> has no descriptive alt/aria-label")
        if not (a.get("width") and a.get("height")):
            fail(name, f"<{tag} src={a.get('src')}> is missing width/height")

    # §7 — skip link first, main present
    ff = page.first_focusable or {}
    if ff.get("href") != "#main" or "skip" not in ff.get("class", ""):
        fail(name, "the first focusable element must be the .skip link to #main")
    if not page.has_main:
        fail(name, "no element with id=main")
    if not page.lang:
        fail(name, "<html> has no lang attribute")

    # §8.15 — no placeholder links
    for href in page.hrefs:
        if href.strip() in ("#", "", "javascript:void(0)"):
            fail(name, "placeholder href on a link")

    # §4 — no styling in the markup
    for tag, style in page.inline_styles:
        fail(name, f"inline style on <{tag}>: {style[:40]}")
    if re.search(r"<style[\s>]", raw):
        fail(name, "inline <style> block; styling belongs in design-system.css")

    # §1 / §8 — banned vocabulary and emoji
    low = text.lower()
    for word in BANNED_WORDS:
        if word in low:
            fail(name, f"banned word from DESIGN.md: {word!r}")
    if EMOJI.search(text):
        fail(name, "emoji in page content (DESIGN.md §8.4)")

    # §7 — every string translatable in both dictionaries
    for key in sorted(set(page.i18n_keys)):
        for lang, keys in dicts.items():
            if key not in keys:
                fail(name, f"data-i18n key {key!r} missing from the {lang} dictionary")

    # §7 — head essentials
    for needle, label in (
        ('rel="canonical"', "canonical link"),
        ('name="description"', "meta description"),
        ('property="og:image"', "og:image"),
    ):
        if needle not in raw:
            fail(name, f"missing {label}")

    # §7 — privacy
    if re.search(r"\+358[\s\d]{6,}", raw):
        fail(name, "a phone number is published (DESIGN.md §7)")


def main(argv):
    pages = [Path(p) for p in argv[1:]] or sorted(ROOT.glob("*.html"))
    problems = []

    def fail(where, msg):
        problems.append(f"{where}: {msg}")

    dicts = i18n_dictionaries()
    check_stylesheet(fail)
    for page in pages:
        check_page(page, dicts, fail)

    if problems:
        print(f"design_check: {len(problems)} problem(s)\n")
        for p in problems:
            print("  ✗ " + p)
        return 1

    checked = ", ".join(p.name for p in pages)
    print(f"design_check: clean — {checked} + {STYLESHEET.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
