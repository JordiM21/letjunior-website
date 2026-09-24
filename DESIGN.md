# LET Academy — Style Reference

> **Superseded 2026-09-24 by the "playground" redesign.** The page now sits on
> a fixed cartoon world (sky that shifts morning → lavender → sunset on
> scroll, a smiling sun that sets, drifting clouds, mountain/hill/tree layers
> that pan sideways at different speeds — all inline SVG in `index.html`).
> The palette is now vibrant (grape `#7B61FF`, mango, sun, grass, sky, bubble,
> each with `-ink`/`-edge`/`-soft` twins in `styles.css :root`). Cards and
> buttons are chunky, with a solid bottom "edge" shadow in place of the single
> soft shadow. New sections: stat counters and the "El camino de tu peque"
> journey map (road drawn on scroll by `main.js`). Tappable emoji stickers
> (`.stk`), confetti on correct answers, lesson completion, intake finish and
> the final CTA. Fonts, real photography, copy, the demo lesson and the
> WhatsApp intake flow are unchanged. The Aaply-era notes below are history.

> LET's own brand, rebuilt on an Aaply-style structural system

**Theme:** light

This redesign takes its **structure, shapes, and motion patterns** from a
DESIGN.md-format reference the user supplied (an "Aaply" style: flat, fully
rounded, single-shadow, floating nav card, product-screenshot-frame hero) —
but keeps **LET's own colors, fonts, and real assets** unchanged. Nothing
about the accent color, type family, or photography is new; what changed is
how sections are built: flat cards instead of gradients/backdrop-blur, one
shared drop shadow instead of colored glows, pill-shaped buttons throughout,
a floating white nav-bar card, a dot-grid page texture, "highlight ring"
containers (2–3px brand-color border) for the standout plan/review/final CTA,
and inline emoji in the hero headline.

## Tokens — Colors (LET's own, unchanged)

| Name | Value | Token | Role |
|------|-------|-------|------|
| Mango | `#FF7A3D` | `--mango` | Logo mark, decorative fills, highlighter-box word in the hero |
| Mango deep | `#E85F22` | `--mango-deep` | Hover state |
| CTA orange | `#CA4B15` / `#BA4410` | `--cta` / `--cta-deep` | Primary filled pill button (white text) |
| Bubble pink | `#FF4D8D` | `--bubble` | Decorative accent, "wrong" states |
| Splash teal | `#22AECB` | `--splash` | Secondary accent |
| Sky blue | `#4080D0` | `--sky` | Live badges, connectors, focus ring |
| Sun gold | `#FFC93D` | `--sun` | Highlight-ring borders (plan ring, final CTA panel, standout review) |
| Carbon | `#1C1620` | `--ink` | Primary text |
| Paper white | `#FFFFFF` | `--surface` | Every card, nav bar, product frame |
| Graphite mist | `#F2F2F2` | `--ground` | Page canvas, now with a faint dot-grid texture (new pattern, old color) |

Ink-safe darker twins (`--mango-ink`, `--splash-ink`, `--bubble-ink`,
`--sky-ink`) carry any brand hue used as small text or as a solid fill with
white text/icon on it — unchanged from the original system, since every
bright brand color still fails WCAG AA that way.

## Typography (LET's own, unchanged)

- **Fredoka** (self-hosted variable woff2) — display: hero, h2/h3, nav wordmark, plan price.
- **Figtree** (self-hosted variable woff2) — body: paragraphs, buttons, labels, nav links.
- Both preloaded same-origin, as before this redesign.

## Shapes (new structural pattern)

- Buttons/tags/pills: fully rounded (`--r-pill: 3000px`).
- Cards: 32–40px (`--r-l` / `--r-xl`).
- Inputs / small tiles: 16–20px.
- Product frame (hero mock): 16px.
- Nav bar: 30px, floating with `--shadow-m` — the only shadow in the system now (no more colored glows, no backdrop-blur).

## Components (structure translated onto LET's own colors/content)

- **Filled orange pill button** — `.btn-primary` (`--cta`/`--cta-deep`, white text), every primary CTA.
- **Filled black pill button** — `.btn-invert`, the final-panel CTA.
- **Ghost pill button** — `.btn-outline`, secondary actions ("Probar una pregunta ahora").
- **Navigation bar card** — `.hdr-in`, floating white rounded bar with the single system shadow, LET's logo mark on a mango-orange plate.
- **Product screenshot frame** — `.hero-visual`/`.screen-mock`, the live-class hero mock: traffic-light dots (mango/bubble/sky), dot-grid ground, real student/teacher photos (not illustrated — LET's evidence is real photography, preserved as-is).
- **Highlight ring container** — used three times, each in its own brand hue: the entry plan (mango ring), the standout written review (sun-gold ring), and the final CTA panel (sun-gold ring, replacing the old gradient panel).
- **Annotation tag** — pill tags in `--bubble-ink`, e.g. the entry-plan's "PARA EMPEZAR" tag.
- **Emoji-in-headline** — the hero h1 and final-panel peek characters carry inline emoji.

## What changed vs. the previous build

Only structure, shape, and motion patterns changed: flat cards replace the
old gradient washes and backdrop-blur "glass" cards; floating blob
decorations are retired in favor of a fixed dot-grid canvas texture; one
shared drop shadow replaces per-section colored glows; the nav becomes a
floating rounded card; final CTA becomes a highlight-ring card instead of a
gradient panel. **Colors, fonts, copy, real photography, the gamified demo
lesson, the WhatsApp intake flow, and all `main.js` behavior are unchanged**
— JS class hooks (`reveal`, `is-in`, `is-stuck`, `is-current`, `right`/`wrong`,
etc.) were preserved exactly so existing interaction logic keeps working.

## Known follow-ups (not done in this pass)

- Content TODOs (teacher certifications, legal entity footer details, etc.)
  listed in `LAUNCH.md` are unrelated to this redesign and remain open.
