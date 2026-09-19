export default function rgbToHsl(rgbString: string) {
  const [r, g, b] = rgbString.split(',').map(n => Number(n.trim()) / 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Lightness
  const l = (max + min) / 2;

  // Saturation
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Hue
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return `${h},${Math.round(s * 100)},${Math.round(l * 100)}`;
}