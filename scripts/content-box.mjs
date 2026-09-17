/* Find the real picture inside a screenshot.
 *
 * Screen recordings of a video call arrive letterboxed: a portrait phone
 * camera in a landscape frame leaves flat bars down both sides. Those bars
 * are not content, and scaling them into a layout wastes the tile.
 *
 * A bar is flat: its mean is near-black or near-white AND its variance is
 * almost nothing. Both tests together, so a genuinely dark edge of a photo
 * (a shadowed wall, dark hair against a dark room) is not eaten.
 */
import sharp from 'sharp';

export async function contentBox(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const px = (x, y) => { const i = (y * W + x) * C; return (data[i] + data[i + 1] + data[i + 2]) / 3; };
  const stat = (get, n) => {
    let s = 0, s2 = 0;
    for (let i = 0; i < n; i++) { const v = get(i); s += v; s2 += v * v; }
    const m = s / n;
    return [m, Math.sqrt(Math.max(s2 / n - m * m, 0))];
  };
  const flat = ([m, sd]) => (m < 30 || m > 240) && sd < 14;

  let L = 0, R = W - 1, T = 0, B = H - 1;
  while (L < W * 0.45 && flat(stat(y => px(L, y), H))) L++;
  while (R > W * 0.55 && flat(stat(y => px(R, y), H))) R--;
  while (T < H * 0.45 && flat(stat(x => px(x, T), W))) T++;
  while (B > H * 0.55 && flat(stat(x => px(x, B), W))) B--;

  return { left: L, top: T, width: R - L + 1, height: B - T + 1, srcW: W, srcH: H };
}
