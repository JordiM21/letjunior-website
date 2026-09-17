# reviews/ — profile photos for the written reviews

**Feeds:** the four review cards in "Lo que nos escriben los padres".
**Status:** done — four photos in place.
**Send:** any photo where the reviewer's face is clear. **300px minimum**;
bigger is better. They render as 56px circles.

## These are family photos, not headshots — and that is fine

Only one of the four is a straight portrait. The rest are family snaps: a
mother holding her baby, a dad taking a selfie with his daughter. That is more
honest for this brand than stock headshots, but it means **the reviewer is
rarely in the middle of the frame**, so the crop cannot be left to CSS.

Each photo has a focus point in `scripts/optimize-images.mjs`, under the
`reviews` slot:

```js
'jose-ramirez': [0.80, 0.44, 0.70]
//                 x     y    zoom
```

- **x, y** — where the reviewer's face is, as a fraction of the image.
  `[0.5, 0.5]` is dead centre; `0.80` is four-fifths of the way right.
- **zoom** — how tight to crop. `1` is the largest square that fits the photo;
  `0.46` pulls one face out of a group shot.

The build crops a square around that point, clamped so it never runs off the
edge, then resizes. To add a review: drop the photo in, add a focus entry,
run `npm run assets`, and check the result — a wrong focus point is obvious
immediately at 56px.

## Before it ships

**Written consent from the reviewer**, and from any parent whose child appears
in the photo. Three of these four have children in frame.
