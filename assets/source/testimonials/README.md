# testimonials/ — poster frames for the video testimonials

**Feeds:** the four video cards in "Lo que dicen las familias".
**Status:** done — four real posters are in here, pulled from the YouTube
videos at 1280×720 and processed by `npm run assets`.

## How the cards work

Each card is a **facade**, not a YouTube embed. It ships only the local poster
below; nothing is requested from YouTube until a parent actually presses play,
and then it loads through `youtube-nocookie.com`. Four real embeds would have
cost roughly 2 MB and several third-party connections before anyone watched
anything.

## Adding another testimonial

1. Drop the poster here as `testimonio-<nombre>.jpg`, **1280×720 or larger**.
   Straight from YouTube works: `https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg`
2. `npm run assets`
3. Copy a `<li class="card vid">` block in `index.html`, and change the
   video id (`data-yt`), the name, the course, the pull quote and the
   description. The poster paths follow the filename.

## What makes a good one

- **A real sentence from the parent** as the pull quote. The quote on the card
  is what sells it; the video proves it is real.
- Under two minutes. Parents watch these on a phone, often with the sound off
  at first.
- **Consent to publish**, on file, before it ships — the parent is identifiable
  and so, usually, is the child.
