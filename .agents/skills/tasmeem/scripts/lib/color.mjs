// Colour parsing, conversion (sRGB <-> OKLab/OKLCH) and WCAG contrast. No dependencies.

const NAMED = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], blue: [0, 0, 255], green: [0, 128, 0],
  gray: [128, 128, 128], grey: [128, 128, 128], purple: [128, 0, 128], indigo: [75, 0, 130],
  violet: [238, 130, 238], cyan: [0, 255, 255], orange: [255, 165, 0], yellow: [255, 255, 0],
}

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

/** Parse a CSS colour into { r, g, b, a } with r,g,b in 0..255. Returns null when it cannot. */
export function parseColor(input) {
  if (!input) return null
  const s = String(input).trim().toLowerCase()
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  if (NAMED[s]) { const [r, g, b] = NAMED[s]; return { r, g, b, a: 1 } }
  let m = s.match(/^#([0-9a-f]{3,8})$/)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    const n = (i) => parseInt(h.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }
  }
  m = s.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean)
    const ch = (v) => (v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v))
    const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])
    return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a }
  }
  m = s.match(/^hsla?\(([^)]+)\)$/)
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean)
    const h = (((parseFloat(p[0]) % 360) + 360) % 360) / 360
    const sat = parseFloat(p[1]) / 100
    const l = parseFloat(p[2]) / 100
    const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat
    const pp = 2 * l - q
    const hue = (t) => {
      t = (t + 1) % 1
      if (t < 1 / 6) return pp + (q - pp) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6
      return pp
    }
    return { r: hue(h + 1 / 3) * 255, g: hue(h) * 255, b: hue(h - 1 / 3) * 255, a }
  }
  m = s.match(/^oklch\(([^)]+)\)$/)
  if (m) {
    const p = m[1].split(/[\s/]+/).filter(Boolean)
    if (p.some((v) => v.startsWith('var(') || v === 'from')) return null
    const L = p[0].endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0])
    const C = p[1].endsWith('%') ? (parseFloat(p[1]) / 100) * 0.4 : parseFloat(p[1])
    const H = parseFloat(p[2]) || 0
    const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])
    const [r, g, b] = oklchToRgb(L, C, H)
    return { r, g, b, a }
  }
  return null
}

const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const fromLinear = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function rgbToOklab({ r, g, b }) {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

export function rgbToOklch(rgb) {
  const { L, a, b } = rgbToOklab(rgb)
  const C = Math.sqrt(a * a + b * b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H }
}

export function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180
  const a = C * Math.cos(hr), b = C * Math.sin(hr)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return [r, g, bb].map((c) => clamp(fromLinear(c), 0, 255))
}

export const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
export const fmtOklch = ({ L, C, H }) => `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`

/** Composite a colour with alpha over an opaque background. */
export function over(fg, bg) {
  const a = fg.a ?? 1
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 }
}

export function luminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function contrast(fg, bg) {
  const f = fg.a < 1 ? over(fg, bg) : fg
  const L1 = luminance(f), L2 = luminance(bg)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

/** Hue families used by the tells. H in degrees (OKLCH). */
export function hueFamily({ L, C, H }) {
  if (C < 0.04) return L > 0.92 ? 'white' : L < 0.18 ? 'black' : 'neutral'
  if (H >= 268 && H < 320) return 'violet'      // indigo / purple / violet (indigo-500 ≈ 277, violet-600 ≈ 293)
  if (H >= 200 && H < 268) return 'blue'        // blue / cyan-blue (blue-500 ≈ 260)
  if (H >= 170 && H < 200) return 'cyan'
  if (H >= 110 && H < 170) return 'green'
  if (H >= 70 && H < 110) return 'yellow'
  if (H >= 30 && H < 70) return 'orange'
  return 'red'                                  // red, pink, magenta
}

/** The "cream by default" band: warm near-white ground. */
export function isCream({ L, C, H }) {
  return L >= 0.84 && L <= 0.975 && C >= 0.008 && C < 0.06 && H >= 40 && H <= 100
}

export const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\([^)]*\)/g
