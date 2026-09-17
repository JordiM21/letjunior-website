# What to send me, and in what format

Every folder in `assets/source/` is named after **the thing on the page it
replaces**, and each one has its own README with the brief for that slot. Drop
files in and run `npm run assets`. That produces AVIF + WebP at every size the
layout actually uses, plus a manifest.

You never hand me an optimised file — **always send the biggest, cleanest
original you have** and let the pipeline compress. Compressing twice is how
images end up looking like a screenshot of a screenshot.

---

## The folders, and what each one fixes

| Folder | What it replaces on the page | How many | Format | Minimum size |
|---|---|---|---|---|
| `students/` | ~~the fake video-call mock~~ **done** — 7 real students in the hero | 7+ | PNG/JPEG | any, bigger is better |
| `hero/` | *(free — the hero now uses the real class grid instead)* | — | — | — |
| `class-activities/` | Nothing yet — the missing proof that classes are fun | 6–12 | JPEG | 1600px wide |
| `teachers/` | ~~emoji~~ **photos done** — 3 portraits + team shot + a class grab. **names + certifications done** (2026-09-12: "Certificad@ internacionalmente") | 1 per teacher | JPEG | 1120px wide |
| `testimonials/` | ~~letter circles~~ **done** — 4 video posters in place | 1 per video | JPEG | 1280×720 |
| `reviews/` | **done** — 4 reviewer photos in place | 1 per review | JPEG/WebP | 300px+ |
| `method-icons/` | 🎮 🎬 👩‍🏫 in *Nuestro método* | 3 | SVG or PNG + alpha | 256px square |
| `characters/` | 🐙 🦕 peeking over the final CTA | 2+ | PNG + alpha | 600px long edge |
| `brand/` | **done** — real globe mark in header/footer, favicon, og:image. **A vector master is still worth sending** | — | SVG ideally | 1080px+ |

**Start with `teachers/` and `class-activities/`.** Those two carry the whole
"these are real people having a good time" claim that the rest of the page is
built on. The emoji are charming for about four seconds and then they read as
a site that has not launched yet.

### Not an image, but blocking

These are placeholders in the HTML that no photo can fix — send them as text:

| Marked in `index.html` | Needed |
|---|---|
| `+250 familias felices` | The real number, or we drop the claim |
| `4.9★`, `+12 profesores` | Real figures |
| ~~The four testimonials~~ | **Done** — four real video testimonials are live. Confirm you have written consent on file for each family. |
| **Teacher names** | The cards read "Nombre pendiente" — a real face must never carry an invented name |
| `Grupos de máx. 4` | Confirm the real group size |
| `90 % habla en su primera clase` | A defensible source, or the line goes |
| Schedule, price, cancellation policy | Real terms — three FAQ answers are invented |
| WhatsApp number, booking URL, login URL | The real links; they are all `href="#"` today |
| Razón social, CIF, domicilio | Required in the footer for a Spanish business |

---

## Never send me

Anything that has been through WhatsApp, Slack, Google Docs or email preview.
All of them re-compress. Use a shared Drive folder, a zip, or drop the files
straight into the right `assets/source/` folder.

---

## Naming

`<slot>-<name>.<ext>`, lowercase, hyphens, no accents or spaces:

```
assets/source/hero/hero-clase-en-directo.png
assets/source/reviews/maria-jose-acevedo.webp
assets/source/class-activities/actividad-marionetas.jpg
assets/source/teachers/profe-sarah.jpg
assets/source/method-icons/icono-plataforma.png
assets/source/characters/mascota-saluda.png
```

Files land in `assets/optimized/<folder>/<name>-<width>.<avif|webp>` and get
listed in `assets/optimized/manifest.json`.

---

## Drawing the characters to one scale

Because the same characters recur across the site, they have to be drawn to one
scale. Send them as **one model sheet plus individual cut-outs**:

- **Same canvas height for every character**, so relative sizes are correct
  without me guessing. A tall adult and a small child should differ in the file,
  not in my CSS.
- **Transparent background.** No baked ground shadow, no frame, no white box.
  I add shadows in CSS so they adapt to whatever they sit on.
- **10% empty padding** around the figure so nothing clips when it animates.
- One file per pose. `mascota-saluda.png`, `mascota-senala.png`.
- If they came from Illustrator or Figma, send the **source file too** — it costs
  you nothing and lets me re-export at a different crop without asking.

---

## The scroll-scrubbed video

You asked what format is best for a loop that plays forward and backward as you
scroll. The format is the easy half; the honest answer is about **where you put it**.

### The cost, stated plainly

There are three ways to build this and all three are expensive:

1. **`<video>` scrubbed by `currentTime`.** Fewest bytes, worst reliability.
   Seeking only lands cleanly on keyframes, so smooth scrubbing needs a keyframe
   on *every* frame (`-g 1`), which inflates the file 3–5×. iOS Safari throttles
   seeking hard, so it stutters exactly where most of your traffic is.
2. **Canvas + image sequence.** What most "Apple-style" scroll videos actually
   are. Rock solid and genuinely buttery — but 60 frames at 1200px is roughly
   1.5–2.4 MB.
3. **Animating real elements with CSS/SVG on scroll.** Nearly free, but only
   works for motion we synthesise, not for filmed or rendered footage.

Our page is currently **71 KB of code with zero dependencies**, and our traffic is
cold mobile Meta clicks on 4G where LCP under 2s is a conversion feature. A
2 MB scroll effect is 28× the entire site.

### What I'd actually do

- **Not in the hero.** The hero has one job — paint fast and show the offer. A
  scrubbed video there trades conversion for polish, which is the wrong trade on
  paid traffic.
- **Put it in Método**, or a new "cómo es una clase por dentro" section. By then
  the visitor has chosen to keep reading and the bytes are earned.
- **Desktop: scrub. Mobile: don't.** On mobile show the poster frame, or a 2-second
  muted autoplay loop under 300 KB. Scrubbing on a phone costs frames and gains
  almost nothing.
- **Load it only when the section approaches the viewport**, never at page load.
- **`prefers-reduced-motion` gets a still frame**, always.
- **Budget: ≤ 900 KB desktop, 0 extra bytes on mobile** beyond the poster.

### What to send me for it

| | |
|---|---|
| **Master format** | ProRes 422, DNxHD, or H.264 at ≥ 30 Mbps |
| **Duration** | **2–4 seconds. This is the single biggest lever.** A 10s scrub is 3× the bytes for no extra meaning |
| **Frame rate** | 25 or 30 fps — I may decimate to 15 for the scrub |
| **Resolution** | 2× final display. Showing at 600px → send 1200px. **Not 4K** |
| **Alpha** | **Avoid.** Transparent video needs HEVC-alpha for Safari and VP9-alpha for Chrome — two encodes and a permanent maintenance trap. If the subject must float, send a **WebP frame sequence with alpha** instead, or composite onto the brand gradient |
| **Loop** | For scrubbing, first and last frame need not match — it reverses. If we *also* autoplay it on mobile, make them identical |
| **Poster** | Send the hero frame separately as PNG |
| **Audio** | None. It will be muted; audio is dead weight |

I ship it as MP4 (H.264, `yuv420p`, `+faststart`) plus WebM (VP9) for the browsers
that take it, with `muted`, `playsinline`, `preload="none"` and a poster.

Video conversion needs ffmpeg, which isn't installed here yet. When there's real
footage: `npm i -D ffmpeg-static` pulls a prebuilt binary, no system install.

---

## What already happens automatically

Once files are in and `npm run assets` has run, every image I place gets:

- `<picture>` with **AVIF → WebP**, best format the browser accepts
- `srcset` at 1× and 2× so phones don't download desktop-sized files
- **Explicit `width` and `height`** so nothing shifts as it loads (layout shift is
  a ranking factor *and* it makes a page feel cheap)
- `loading="lazy"` + `decoding="async"` everywhere below the fold
- `fetchpriority="high"` and **no lazy loading** on the hero image — lazy-loading
  your LCP element is the most common own-goal in web performance

---

## Checklist before you send

- [ ] Originals, not exports. Biggest version you have.
- [ ] Each file in the folder named after the slot it fills.
- [ ] Teacher portraits shot to one brief, uncropped.
- [ ] Characters on transparent PNG, all at one consistent scale.
- [ ] Icons as SVG where they're genuinely vector.
- [ ] Video 2–4 seconds, no alpha, no audio, 2× display size.
- [ ] Written consent for every recognisable child.
- [ ] The text placeholders answered too — prices, schedule, real numbers.
- [ ] Nothing routed through WhatsApp or Slack.
