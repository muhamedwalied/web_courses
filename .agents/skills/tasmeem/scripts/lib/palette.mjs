// Dominant colours of a PNG (8-bit RGB/RGBA/grey, non-interlaced), with k-means in OKLab. No dependencies.
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { rgbToOklab, rgbToOklch, toHex, fmtOklch } from './color.mjs'

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG (convert JPEG/WebP to PNG first, or use render on a page)')
  let pos = 8, width, height, depth, type, interlace
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (kind === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; type = data[9]; interlace = data[12] }
    else if (kind === 'IDAT') idat.push(data)
    else if (kind === 'IEND') break
    pos += 12 + len
  }
  if (depth !== 8 || interlace) throw new Error('only 8-bit non-interlaced PNG is supported')
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[type]
  if (!channels) throw new Error('palette PNGs are not supported; save as RGB/RGBA')
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const px = Buffer.alloc(height * stride)
  let prev = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const out = px.subarray(y * stride, (y + 1) * stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[x - channels] : 0, b = prev[x], c = x >= channels ? prev[x - channels] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c }
      out[x] = v & 255
    }
    prev = out
  }
  return { width, height, channels, px }
}

export function paletteOf(file, k = 6) {
  const { width, height, channels, px } = decodePng(readFileSync(file))
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 40000)))
  const pts = []
  for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
    const i = (y * width + x) * channels
    const a = channels === 4 ? px[i + 3] : channels === 2 ? px[i + 1] : 255
    if (a < 128) continue
    const rgb = channels >= 3 ? { r: px[i], g: px[i + 1], b: px[i + 2] } : { r: px[i], g: px[i], b: px[i] }
    const lab = rgbToOklab(rgb)
    pts.push([lab.L, lab.a, lab.b, rgb])
  }
  // k-means++ seeding, deterministic by index.
  const cent = [pts[Math.floor(pts.length / 2)].slice(0, 3)]
  while (cent.length < k) {
    let best = null, bestD = -1
    for (let i = 0; i < pts.length; i += Math.ceil(pts.length / 2000)) { const d = Math.min(...cent.map((c) => dist(pts[i], c))); if (d > bestD) { bestD = d; best = pts[i] } }
    cent.push(best.slice(0, 3))
  }
  let assign = new Array(pts.length).fill(0)
  for (let iter = 0; iter < 12; iter++) {
    assign = pts.map((p) => { let bi = 0, bd = Infinity; cent.forEach((c, i) => { const d = dist(p, c); if (d < bd) { bd = d; bi = i } }); return bi })
    for (let i = 0; i < k; i++) {
      const mem = pts.filter((_, j) => assign[j] === i)
      if (mem.length) cent[i] = [0, 1, 2].map((d) => mem.reduce((s, p) => s + p[d], 0) / mem.length)
    }
  }
  return cent.map((c, i) => {
    const mem = pts.filter((_, j) => assign[j] === i)
    const rgb = mem.length ? { r: avg(mem, 'r'), g: avg(mem, 'g'), b: avg(mem, 'b') } : { r: 0, g: 0, b: 0 }
    return { hex: toHex(rgb), oklch: fmtOklch(rgbToOklch(rgb)), share: +(mem.length / pts.length).toFixed(3) }
  }).sort((a, b) => b.share - a.share)
}
const dist = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
const avg = (m, k) => m.reduce((s, p) => s + p[3][k], 0) / m.length
