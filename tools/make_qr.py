#!/usr/bin/env python3
"""Generate the contact QR codes as SVG.

    pip install segno
    python3 tools/make_qr.py

Writes assets/img/qr/<name>.svg for each entry in CODES. Regenerate whenever a
target URL changes — the SVGs are committed, so the site itself needs no
generator and makes no third-party request. Deliberately not a QR *service*:
a remote image would leak every visitor to a third party and break offline.

Modules are drawn in a fixed ink colour on a transparent ground, and the page
sits them on a permanently light tile (--qr-ground). That is intentional: an
inverted QR — light modules on a dark ground — is rejected by many phone
cameras, so these must not follow the dark theme.
"""

import sys
from pathlib import Path

try:
    import segno
except ImportError:
    sys.exit("segno is not installed. Run: pip install segno")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "qr"

# Only URLs that are already published as links on the page belong here.
# A QR code is not obfuscation: anything encoded in one is trivially decoded,
# by a scraper as easily as by a phone, so never put a detail in a QR that you
# would not print in plain text next to it.
CODES = {
    "linkedin": "https://linkedin.com/in/lion504",
    "github": "https://github.com/Lion504",
    # WhatsApp's own invite link. Deliberately NOT wa.me/<number>, which would
    # publish the phone number in scannable plain text. Revoking the link in
    # WhatsApp invalidates this code — regenerate here if that ever happens.
    "whatsapp": "https://wa.me/qr/T5G4UJ4FHHBJJ1",
}

# Error correction M tolerates ~15% damage — enough for a screen or a printed
# card without inflating the module count the way H would.
ERROR = "m"
SCALE = 8
BORDER = 2          # quiet zone in modules; below 2 scanners start to struggle
INK = "#14141A"     # matches --ink; the tile behind it is always light


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, url in CODES.items():
        qr = segno.make(url, error=ERROR)
        path = OUT / f"{name}.svg"
        qr.save(
            path,
            kind="svg",
            scale=SCALE,
            border=BORDER,
            dark=INK,
            light=None,          # transparent, so the tile shows through
            xmldecl=False,
            svgns=True,
            title=url,
        )
        print(f"{path.relative_to(ROOT)}  {qr.symbol_size(scale=1, border=0)[0]} modules  {url}")


if __name__ == "__main__":
    main()
