# DESIGN.md

Guidance for building pages on this site — for humans and for agents.

Load this file together with the stylesheet it describes:

- Guidance: `https://lion504.github.io/DESIGN.md`
- Stylesheet: `https://lion504.github.io/assets/css/design-system.css`

Build with the class names and tokens documented below. Do not invent new
typography, spacing or colour values. If a page needs something the vocabulary
does not have, add it here first, then to the stylesheet — in that order.

---

## 1. Brand

This is the personal site of **Wang Yongzhi**, a software engineering student in
Helsinki looking for an AI engineering internship or junior role. The reader is
almost always a hiring manager or engineer with about ninety seconds and a stack
of other tabs open.

The brand position is **evidence over adjectives**. Every claim on this site is
either a number that can be checked, a link that can be opened, or a screenshot
of the thing running. The design has one job: make the evidence easy to find and
hard to mistake for decoration.

Voice:

- First person, past or present tense, no hedging. "I built the routing layer",
  not "was involved in building".
- Numbers carry the sentence. `183 of 263 commits` beats "major contributor".
- Name the constraint, not the triumph. "The fine-tuned model has to beat four
  baselines or it does not ship" is the brand. "Cutting-edge AI solutions" is not.
- No exclamation marks. No "passionate", "innovative", "leveraging", "seamless",
  "journey", "excited to share".
- British-leaning spelling is used throughout (`visualiser`, `internationalisation`).
  Keep it consistent within a page.

Tone in three words: **precise, unadorned, confident**.

---

## 2. Information architecture

Pages follow one shape: **claim → evidence → route to contact**.

The canonical order for the main page, and the default for any new page:

1. **Identity block** — who, what, where, and availability. One sentence of what
   the work actually is. Never longer than four lines of prose.
2. **Proof strip** — three to five checkable numbers, immediately after identity.
   These exist so a skimmer who reads nothing else still leaves with facts.
3. **Selected work** — the spine of the site. Reverse chronological, most
   significant project first, numbered. Each entry carries the same fields in the
   same order so entries can be compared vertically (see §5, Project entry).
4. **Capabilities** — grouped tool inventory. Reference material, not a pitch.
   Placed *after* work: it answers "with what", which is only interesting once
   the reader believes the "what".
5. **Experience & education** — including the ten years before the degree.
   Two columns: the linear career on the left, awards and references on the right.
6. **Contact** — one clear route, plus the alternatives. It also answers the two
   questions a hiring reader has before they can act: **when can this person
   start**, and **what is the low-risk way to try them**. Both are stated as
   dates, never as "available immediately" in the abstract — a named month is
   something a hiring manager can put in a calendar; an adjective is not.

Rules:

- Sections are numbered `01`–`0n` in the label and in the nav. The numbering is
  the reader's progress bar; keep it visible in both places.
- Never open a page with capabilities, education, or a mission statement.
- One page, one spine. Do not add a second parallel navigation.
- Anything that cannot be shown or checked belongs in prose in an existing
  section, not in a new section of its own.

### Framing the reader's job

Before writing a section, state in one line what the reader should be able to do
after reading it. If the line is "understand that he is enthusiastic", cut the
section. Valid lines look like: "decide whether the JobsResearch architecture is
relevant to our stack", "check the commit share is real", "send an email".

---

## 3. Layout

- Single column of content, max width `--maxw` (1340px), gutters `--gut`
  (`clamp(20px, 5vw, 80px)`). Content never touches the viewport edge.
- A 12-column grid is available (`.grid`) for anything that needs alignment
  across rows. Use it or use flow — do not nest arbitrary percentage widths.
- **Vertical rhythm is the primary structural tool.** Sections are separated by
  `--sp-9`; blocks within a section by `--sp-6`; lines within a block by `--sp-3`.
  Nothing between those steps.
- Section heads are two lines: a mono label with its number, then the section
  title. The title is a full sentence ending in a full stop — it makes an
  assertion rather than naming a category ("Systems I designed, built and
  shipped." not "Projects").
- Media sits to the right of its text at desktop width and below it on mobile.
  Media is never full-bleed and never decorative: every image is a screenshot of
  a real artefact with a caption naming what is on screen.
- Hairline rules (`--line`) separate; whitespace groups. Prefer whitespace.
  Never both a rule and a card border around the same content.

---

## 4. Design system

### Colour

Light ground, ink text, one signal colour. The signal colour marks exactly four
things: the active/available state, the numeric emphasis in the proof strip,
interactive elements under hover or focus, and the block the pointer is currently
resting in. Nothing else may use it — in particular it is never used to decorate
static text.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F7F5F1` | Page ground |
| `--paper-2` | `#FFFFFF` | Raised surface (media frames, form fields) |
| `--paper-3` | `#EDEAE3` | Alternate section band |
| `--hover-ground` | `rgba(20,20,26,.035)` | The block the pointer rests in |
| `--ink` | `#14141A` | Primary text, headings |
| `--ink-2` | `#4A4A52` | Body prose |
| `--ink-3` | `#8A8880` | Meta, captions, disabled |
| `--signal` | `#B4482A` | See the three uses above |
| `--line` | `rgba(20,20,26,.12)` | Hairline rules, borders |
| `--line-soft` | `rgba(20,20,26,.06)` | Internal dividers |

A dark rendering is supported through the same tokens under
`@media (prefers-color-scheme: dark)`. Never define a colour only inside the dark
block, and never hard-code a hex value in page markup.

Contrast floor: body text ≥ 4.5:1, meta text ≥ 4.5:1 at its used size, large
headings ≥ 3:1. `--ink-3` on `--paper` is the lightest permitted text pairing.

### Type

Three families, each with one job:

- `--ff-display` — **Instrument Serif**. Headings only: `h1`, `.sec__title`,
  project names. Never for body, never for UI.
- `--ff-body` — **Inter**. All prose and UI. Weights 300/400/500 only.
- `--ff-mono` — **JetBrains Mono**. Labels, numbers, dates, captions, chips.
  Uppercase with `.14em` tracking at 11px via `.mono`.

Scale (all fluid, all defined as tokens — do not write raw `font-size` in a page):

| Token | Clamp | Use |
|---|---|---|
| `--fs-display` | `clamp(3.2rem, 9vw, 7.5rem)` | Name, once per page |
| `--fs-h2` | `clamp(1.9rem, 3.6vw, 3.1rem)` | Section titles |
| `--fs-h3` | `clamp(1.25rem, 2vw, 1.6rem)` | Project and entry names |
| `--fs-lede` | `clamp(1.05rem, 1.5vw, 1.3rem)` | Opening paragraph only |
| `--fs-body` | `1rem` | Prose |
| `--fs-meta` | `.8125rem` | Secondary lines |
| `--fs-mono` | `.6875rem` | `.mono` labels |

Measure: prose caps at `68ch` (`--measure`). Lede caps at `52ch`. A paragraph
wider than its measure is a bug, not a style choice.

Headings never exceed three lines at any viewport. Body copy is never centred;
only the section head of a `sec--center` may be.

### Spacing

Only these steps exist: `--sp-1` 4px, `--sp-2` 8px, `--sp-3` 16px, `--sp-4` 24px,
`--sp-5` 32px, `--sp-6` 48px, `--sp-7` 64px, `--sp-8` 96px, `--sp-9` 128px.
Every margin, padding and gap resolves to one of them.

### Motion

- One transition curve: `--ease` `cubic-bezier(.22,.61,.36,1)`.
- Two durations: `--t-fast` 180ms for hover/focus, `--t-slow` 520ms for reveals.
- Entry animation is a single 12px rise with opacity, applied via `.reveal`.
  Stagger only within the first viewport.
- Everything above collapses to no motion under
  `@media (prefers-reduced-motion: reduce)`. Video autoplay is suppressed there
  and the poster frame stands.

#### Hover

Hover is feedback, not entertainment. There are **four gestures**, and a page
uses them rather than inventing a fifth:

| Gesture | Distance | Where |
|---|---|---|
| Colour shift | — | Row numbers, chips, grade rows, contact keys, captions |
| Block response | — | The whole entry the pointer rests in (see below) |
| Underline wipe | — | Nav links, project links, capability headings |
| Lift | `--hover-lift` 2px up | Buttons and chips — things you can press |
| Nudge | `--hover-nudge` 4px toward what it points at | Arrows, contact values, back-to-top |

Plus one exception: a **slow zoom** to `--hover-zoom` (1.04) on media, and only
inside a frame that already clips it. Never on a bare image.

Two rules govern all of it:

- **The row answers as a whole.** Hovering anywhere in a project entry responds
  once, as a single block: the ground lifts to `--hover-ground`, a 2px signal
  rule wipes down the left edge, the index and the project name take the signal
  colour, the frame border darkens and the shot zooms. Six separate hover targets
  inside one row is noise.
- **The response cannot depend on the media.** Not every entry carries a
  screenshot, and an entry without one must react exactly as legibly as an entry
  with one. Anything keyed only to `.proj__shot` leaves the text-only entries
  feeling dead — check a media-less block before calling a hover change done.
- **Colour responds everywhere a pointer exists; movement asks permission.**
  Colour and wipe gestures live in `@media (hover:hover)`. Every gesture that
  moves something lives in `@media (hover:hover) and
  (prefers-reduced-motion: no-preference)`, so a reader who asked for less motion
  still gets the feedback without the travel. Neither applies on touch, where a
  stuck hover state reads as a bug.

---

## 5. Components

The vocabulary is deliberately small. These are all of it.

**`.tag`** — availability pill. One per page, in the identity block.

**`.proof`** / **`.proof__item`** — the proof strip. Big mono number in `--signal`,
mono caption under it. Three to five items on **one row** at tablet width and
above; three per row on a phone. Every number must be verifiable.

**`.sec`** / **`.sec__head`** / **`.sec__label`** / **`.sec__title`** / **`.sec__sub`** —
section scaffolding. `.sec--alt` puts the section on `--paper-3`.

**Project entry** — `.proj`, with `.proj--shot` when it carries media. Fields
appear in this fixed order, and an entry omits a field rather than reordering:

1. `.proj__no` — the index, mono.
2. `h3` — project name, display face.
3. `.proj__when` — date range, mono.
4. `.proj__role` — role and commit share, mono. This is the credibility line;
   it is never vague. Either give a countable share or say "sole author".
5. `.proj__desc` — 40–90 words. What it does, then what *I* specifically built.
   The second half of the paragraph must be first-person and specific.
6. `.proj__stat` — optional single headline number.
7. `.chips` — stack, in dependency order (language → framework → data → infra).
8. `.proj__links` — live link first, repo second. A private repo says so in
   `.lock` rather than showing a dead link.
9. `.proj__shot` — screenshot or clip, with a `figcaption` naming what is shown.

**Media frames.** Source screenshots arrive at whatever aspect the capture
happened to be. They must never render at those raw sizes: every `.proj__shot`
frame is `--ratio-shot` and the portrait is `--ratio-portrait`, with the media
`object-fit: cover` from the top. A column of shots at six different heights
reads as six different levels of care. Media still carries its true intrinsic
`width`/`height` in the markup so the browser can reserve space — which means the
reset must keep `height: auto`, or those attributes win and every shot renders
distorted.

**`.chips`** — inventory list. Never more than 14 per group; if more are needed,
the grouping is wrong.

**`.entry`** — timeline item for experience, education and awards. Same field
order as a project: when, name, org, note.

**`.facts`** / **`.fact`** — the availability block at the top of Contact. A mono
key over a plain-language value. Reserved for facts that determine whether the
reader can act at all: start date, thesis window. Never used for a pitch.

**`.cline`** — a contact row: mono key, value. Email is first.

**`.qr`** — QR tiles in the contact section, under the contact rows. Each tile
links to the same URL it encodes, so it works whether the reader scans it from
another device or simply clicks it. Rules:

- **A QR may only encode a URL already published as a link on the page.** A QR
  is not obfuscation — a scraper decodes one as easily as a phone does. If a
  detail is not safe printed in plain text beside the code, it is not safe inside
  it (see §7).
- Codes are committed SVGs generated by `tools/make_qr.py`, never fetched from a
  QR service: a remote image would leak every visitor to a third party.
- **Tiles never follow the theme.** They sit on `--qr-ground` with `--qr-ink`
  modules in both light and dark, because many phone cameras refuse an inverted
  code. These are the only two colours exempt from the dark rendering.
- Caption each tile with the destination, and keep the plain link above it. The
  QR supplements the link; it never replaces it. The one exception is the tile
  for this site: the reader is already on it, so the page itself is the link.
- Tiles are laid out on a grid, never a wrapping flex row — four tiles must read
  as an even block (four across, or two by two on a phone), not as three and a
  stray. Phone tiles fill their column rather than staying at their desktop size,
  because a larger code is an easier one to scan.

**`.btn`** — `.btn--solid` (one per section, maximum) and `.btn--ghost`.
Never three buttons in a row.

**`.card`** — a raised surface. Used only for media frames and the contact form.
Do not wrap text sections in cards.

---

## 6. Responsiveness

- Breakpoints: `900px` (two-column → one) and `620px` (compact). No others.
- Design the 380px rendering first; the desktop layout is the enhancement.
- Any element wider than its container scrolls inside its own
  `overflow-x: auto` wrapper. The page body never scrolls horizontally.
- A surface that bleeds outside its column — a hover tint, a full-width band —
  bleeds by `--bleed`, never by a raw spacing step. `--gut` bottoms out at 20px
  on a phone, so a fixed 24px bleed hangs 4px past the viewport on every row.
  `body { overflow-x: hidden }` hides that but does not fix it; measure
  `scrollWidth` against `clientWidth` at 375px rather than trusting the clip.
- Touch targets ≥ 44px. Nav collapses to the burger below `900px`.
- **Never put `backdrop-filter` (or `filter`, `transform`, `perspective`) on an
  element that contains a `position:fixed` child.** Any of those make the element
  the containing block for fixed descendants, so the mobile menu overlay would
  size itself to the nav bar instead of the viewport and strand itself on screen
  once the nav sticks. The nav's blur therefore lives on `.nav::before`.
- Any overlay that opens must close three ways: the control that opened it, a tap
  on its own blank area, and `Escape`. It must also release the scroll lock when
  the viewport crosses back to the desktop layout.
- Images carry explicit `width`/`height`, `loading="lazy"` (except the first
  above-fold image, which is `fetchpriority="high"`), and `decoding="async"`.

---

## 7. Publishing standards

Non-negotiable on every page:

- One `h1`. Heading levels never skip.
- Every image has a descriptive `alt` naming what is *in* the screenshot, not
  the project name again.
- Visible focus ring on every interactive element (`:focus-visible`, 2px `--signal`).
- A `.skip` link to `#main` is the first focusable element.
- `lang` attribute set, and kept in sync by the language toggle.
- Title, meta description, canonical, OG image present.
- No public phone number, no downloadable CV, no third-party contact details.
  References are named; their contact details are "available on request".
- The same applies to anything encoded in a QR code, an image, or a `mailto:`
  parameter. Encoding is not redaction: a `wa.me/<number>` code publishes the
  phone number as surely as printing it would.
- All translatable strings carry `data-i18n` keys present in both `en` and `fi`
  dictionaries. Adding copy without its Finnish counterpart is an incomplete change.
- No external JS or CSS beyond the Google Fonts stylesheet. No framework, no
  build step — the site is hand-written HTML, CSS and vanilla JS, and the footer
  says so.

---

## 8. Anti-patterns

Recurring generated-design failures. Do not produce these.

1. **The gradient hero.** Purple-to-blue washes, mesh gradients, glowing orbs,
   animated blobs. The ground is flat paper.
2. **Glassmorphism everywhere.** Backdrop blur is permitted on the stuck nav and
   nowhere else.
3. **Card soup.** Every block in a rounded, shadowed, bordered box. Cards are for
   media frames and the form.
4. **Emoji as iconography.** 🚀 in a heading, ✨ in a bullet. None.
5. **Decorative stock imagery.** Unsplash desks, abstract 3D shapes, AI-generated
   illustration. Every image is a screenshot of something real.
6. **Unverifiable superlatives.** "Passionate", "cutting-edge", "10x",
   "revolutionary", "world-class". If it cannot be checked, cut it.
7. **Skill percentage bars.** "Python 87%" is invented precision. Chips only.
8. **Centred body prose.** Centring is for the section head of a `sec--center`.
9. **Tables that ignore the available width.** A table or code block must fill or
   scroll its container, never overflow the page.
10. **Two competing accent colours.** One signal colour, three permitted uses.
11. **Text on a busy image.** Captions sit outside the frame.
12. **A carousel.** Work is a list. Lists are scannable; carousels hide items.
13. **"Currently learning" sections.** Ship it, then list it.
14. **Icon-only links.** Every link has a text label; the arrow is a suffix.
15. **Placeholder content shipped.** No lorem, no `#` hrefs, no "Project Three".
16. **Hover theatrics.** Bounce, spring, rotation, glow, drop shadows blooming
    on hover, cards tilting toward the cursor, text scaling up, colour cycling.
    Four gestures exist (§4, Hover); anything else is a page showing off rather
    than answering. Movement of more than `--hover-nudge` is always wrong.

---

## 9. Deterministic checks

`tools/design_check.py` mechanically enforces the parts of this file that can be
checked without judgement — hard-coded colours and font sizes outside the token
layer, missing `alt` text, heading-level skips, `data-i18n` keys missing from a
dictionary, `#` hrefs, banned words from §1 and §8, spacing values off the scale,
more than one `h1`, and a reset that lets `width`/`height` attributes distort
media.

Run it before publishing:

```bash
python3 tools/design_check.py
```

A non-zero exit means the page is not ready. Fix the page, not the check —
unless the rule itself turned out to be wrong, in which case change §1–§8 first
and let the check follow.

---

## 10. Changing this file

The file stays useful by being corrected against real output, not by being
complete in the abstract. When a generated page is wrong:

1. Write down the specific complaint ("the role line was vague", "it invented a
   third colour").
2. Decide where it belongs: a rule here, an addition to the stylesheet, or a
   deterministic check.
3. Encode it in exactly one of those places.
4. Watch whether the same complaint recurs. If it does, the rule was too soft —
   make it a check.
