#!/usr/bin/env python3
"""Strip chosen strings out of a CV PDF's text, then install it into the site.

Why this exists: the CV export puts the referees' email addresses in the
sidebar. The site says "Contact details available on request", and publishing
the PDF as-exported breaks that promise and puts two other people's addresses
on an indexable page. Re-exporting the CV brings them back, so this is a step
that has to be repeatable, not something done once by hand.

This removes the glyphs. It does NOT draw a black box -- a box over PDF text
leaves the text sitting underneath, extractable by anyone who runs pdftotext.

    python3 tools/redact_cv.py <source.pdf> [-o assets/Wang-Yongzhi-CV.pdf]

Verify afterwards, and do not trust it without this:

    pdftotext -layout assets/Wang-Yongzhi-CV.pdf - | grep -i metropolia.fi   # want: nothing
    diff <(pdftotext -layout <source.pdf> -) <(pdftotext -layout assets/Wang-Yongzhi-CV.pdf -)
    # want: ONLY the redacted lines differ

Requires pypdf (pip install pypdf).
"""
import argparse
import re
import sys

REDACT = [
    "Sami.BenCheikh@metropolia.fi",
    "amir.dirin@metropolia.fi",
]


def parse_cmap(txt):
    """ToUnicode CMap -> (code->char, char->code). Handles bfchar and bfrange."""
    fwd, rev = {}, {}
    for blk in re.findall(r"beginbfchar(.*?)endbfchar", txt, re.S):
        for src, dst in re.findall(r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk):
            ch = chr(int(dst[:4], 16))
            fwd[src.lower()] = ch
            rev.setdefault(ch, src.lower())
    for blk in re.findall(r"beginbfrange(.*?)endbfrange", txt, re.S):
        for lo, hi, dst in re.findall(
            r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk
        ):
            width = len(lo)
            for k in range(int(hi, 16) - int(lo, 16) + 1):
                src = format(int(lo, 16) + k, "0%dx" % width)
                ch = chr(int(dst[:4], 16) + k)
                fwd[src] = ch
                rev.setdefault(ch, src)
    return fwd, rev


def redact(src_path, out_path, targets):
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import DecodedStreamObject

    writer = PdfWriter(clone_from=src_path)
    total = 0

    for page in writer.pages:
        raw = page.get_contents().get_data().decode("latin-1")
        fonts = page["/Resources"].get("/Font") or {}
        maps = {
            fn: parse_cmap(
                fonts[fn].get_object()["/ToUnicode"].get_data().decode("latin-1", "replace")
            )
            for fn in fonts
            if fonts[fn].get_object().get("/ToUnicode") is not None
        }
        if not maps:
            continue

        # This exporter emits one glyph per `<hex> Tj`, so a target string is
        # never a contiguous byte run -- it has to be found in decoded space.
        # The font name in `/F7 12 Tf` has no slash; the resource key does.
        tok = re.compile(r"/(F\d+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]{2,})>\s*Tj")
        glyphs, cur = [], None
        for m in tok.finditer(raw):
            if m.group(1):
                cur = "/" + m.group(1)
                continue
            ch = maps.get(cur, ({}, {}))[0].get(m.group(2).lower(), "�")
            glyphs.append((m.start(2), m.end(2), cur, ch))

        text = "".join(g[3] for g in glyphs)
        out = list(raw)
        hits = 0
        for target in targets:
            for m in re.finditer(re.escape(target), text):
                for start, end, fn, _ in glyphs[m.start(): m.start() + len(target)]:
                    space = maps[fn][1].get(" ")
                    if space is None or len(space) != end - start:
                        raise SystemExit(
                            f"cannot blank a glyph in {fn}: no same-width space code"
                        )
                    out[start:end] = list(space)
                    hits += 1
        if hits:
            stream = DecodedStreamObject()
            stream.set_data("".join(out).encode("latin-1"))
            page.replace_contents(stream)
            total += hits

    if total == 0:
        raise SystemExit(
            "Nothing was redacted. The targets were not found -- if the CV was "
            "re-exported from a different tool the encoding may differ. Do NOT "
            "publish until you know why."
        )

    with open(out_path, "wb") as fh:
        writer.write(fh)
    return total


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="the freshly exported CV PDF")
    ap.add_argument("-o", "--out", default="assets/Wang-Yongzhi-CV.pdf")
    ap.add_argument("--also", action="append", default=[],
                    help="an extra string to remove (repeatable)")
    args = ap.parse_args()

    n = redact(args.source, args.out, REDACT + args.also)
    print(f"blanked {n} glyphs -> {args.out}")
    print("Now verify. Do not skip this:")
    print(f"  pdftotext -layout {args.out} - | grep -i 'metropolia.fi'")
    print(f"  diff <(pdftotext -layout {args.source} -) <(pdftotext -layout {args.out} -)")


if __name__ == "__main__":
    sys.exit(main())
