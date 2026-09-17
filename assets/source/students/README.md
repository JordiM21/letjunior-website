# students/ — the faces in the live-class mock at the top of the page

**Feeds:** the class grid inside the hero — one teacher tile plus seven students.
**Status:** done — seven students in place, all with parental permission on file.
**Send:** screen grabs from a real class. Any size; bigger is better.

## The black bars are handled

These arrive as screen recordings, so a student joining on a phone shows up as
a portrait video letterboxed into a landscape frame. Samir's grab was 456px
wide, of which **255px was black bar** — the actual picture is 201×262.

You do not need to crop any of that. `scripts/content-box.mjs` finds the real
picture by scanning for flat rows and columns (near-black or near-white, with
almost no variance) and throws them away before anything else happens. It tests
variance as well as brightness so a genuinely dark photo — a child against an
unlit room — is not eaten by mistake.

## Framing

After trimming, each face is centred by a focus point in
`scripts/optimize-images.mjs` under the `students` slot:

```js
mila: { focus: [0.35, 0.30], zoom: 0.75 }
//              x     y             how tight
```

Screen grabs put the child anywhere in the frame — sharing a cartoon, leaning
out of shot, looking down at a notebook. Guessing gets it wrong; check the
result and adjust. A wrong focus point is obvious the moment you look at it.

## Resolution

Tiles render about 80–110px, so these need very little. But **the source sets
the ceiling** — the pipeline never upscales. Jean Paul's grab is 210×115, which
after cropping leaves 92px, so his tile is the one soft face in the grid. If
you can re-grab that one at a larger size it will sharpen up. Everything else
has enough.

## Before it ships

Every child here is identifiable. **Written parental permission, on file, for
each one** — you have said these seven are cleared. Anyone added later needs the
same before their face goes near the hero.
