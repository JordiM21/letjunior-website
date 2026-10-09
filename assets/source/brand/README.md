# brand/ — logo and share image

**Replaces:** the CSS-drawn "LET" block in the header and footer; the missing
`og:image` in `<head>`; `favicon.svg` (currently a stand-in I drew).
**Send:** real vector SVG for the logo — not a bitmap someone auto-traced.

Also needed here:

- **og:image**, exactly **1200×630 PNG or JPEG**. This is the thumbnail on
  WhatsApp and Facebook, so it is often the first thing a parent sees at all.
  Big readable text, logo, no small print.
- the brand colours as hex, if the ones in `styles.css` are not final.

**Not processed by `npm run assets`** — vector and fixed-size files pass through
untouched.

---

## What is here now (updated)

- `30.png` / `31.png` — the full lockup on a light and a dark field, 1080×1080.
  Source material, not used directly on the site.
- `logo-let.png` — the globe on real transparency (sent 2026-10-09, trimmed to
  356×340). This is what the site and the kids app use.

Generated from `logo-let.png`, at the project root: `favicon.png`,
`apple-touch-icon.png` (on the brand field, since Apple ignores transparency)
and `og-image.jpg` at 1200×630.

## Still worth sending

**A vector master (SVG, AI or Figma).** Everything above is recovered from a
flattened 1080px PNG by keying out its background. It is clean at the sizes we
use, but it is a rescue, not a source. With the vector the mark stays crisp at
any size and the globe can be recoloured without artefacts.
