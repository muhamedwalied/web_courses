# tasmeem report

Measured: scan ✓ · built ✓
Totals: P0 10 · P1 43 · P2 15 · brand exceptions 0
Verdict: **FAIL** (a P0, or a P1 accessibility/script/honesty finding, is open)

| # | ID | Sev | Where | Finding | Count | Evidence |
|---|---|---|---|---|---|---|
| 1 | CO-05 | P0 | dist/index.html:7 | Gradient text: gradient text (Tailwind) | 1 | bg-gradient-to-l from-accent to-accent-2 bg-clip-text text-transparent |
| 2 | CO-05 | P0 | src/pages/index.astro:38 | Gradient text: gradient text (Tailwind) | 1 | bg-gradient-to-l from-accent to-accent-2 bg-clip-text text-transparent |
| 3 | QA-02 | P0 | (project) | No visible focus: outline removed and no :focus-visible replacement anywhere | 1 |  |
| 4 | SC-01 | P0 | dist/circles/flutter/index.html:5 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-[10px] tracking-wide text-muted |
| 5 | SC-01 | P0 | dist/circles/front-end/index.html:5 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-[10px] tracking-wide text-muted |
| 6 | SC-01 | P0 | dist/index.html:7 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 2 | font-mono text-[10px] tracking-wide text-muted |
| 7 | SC-01 | P0 | dist/start-flutter/index.html:4 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-[10px] tracking-wide text-muted |
| 8 | SC-01 | P0 | dist/start-front-end/index.html:4 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-[10px] tracking-wide text-muted |
| 9 | SC-01 | P0 | src/layouts/Layout.astro:36 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-[10px] tracking-wide text-muted |
| 10 | SC-01 | P0 | src/pages/index.astro:35 | Tracking on Arabic or Persian: tracking utility next to Arabic text | 1 | font-mono text-xs tracking-widest text-accent |
| 11 | CM-03 | P1 | dist/circles/flutter/index.html:5 | Glass by reflex: backdrop blur (Tailwind) | 1 | sticky top-0 z-40 border-b border-edge/60 bg-bg/80 backdrop-blur |
| 12 | CM-03 | P1 | src/components/graph/CirclesGraph.tsx:41 | Glass by reflex: backdrop blur (Tailwind) | 2 | group w-48 cursor-pointer rounded-xl border bg-panel/95 p-3 text-start shadow-lg backdrop-blur transition hover:scale-[1.03] hover:shadow-xl |
| 13 | CM-03 | P1 | src/layouts/Layout.astro:30 | Glass by reflex: backdrop blur (Tailwind) | 1 | sticky top-0 z-40 border-b border-edge/60 bg-bg/80 backdrop-blur |
| 14 | CO-16 | P1 | (project) | Raw colour outside the tokens: 6 non-token file(s) with many raw colour literals | 1 |  |
| 15 | CP-02 | P1 | dist/start-front-end/index.html:6 | Buzzwords and superlatives: "the ultimate" | 1 | The Ultimate React Course — Jonas Schmedtmann |
| 16 | CP-05 | P1 | dist/circles/flutter/index.html:1 | Dash sprinkle: 5 em dashes in interface strings | 1 |  |
| 17 | CP-05 | P1 | dist/circles/front-end/index.html:1 | Dash sprinkle: 10 em dashes in interface strings | 1 |  |
| 18 | CP-05 | P1 | dist/index.html:1 | Dash sprinkle: 7 em dashes in interface strings | 1 |  |
| 19 | CP-05 | P1 | dist/start-flutter/index.html:1 | Dash sprinkle: 4 em dashes in interface strings | 1 |  |
| 20 | CP-05 | P1 | dist/start-front-end/index.html:1 | Dash sprinkle: 102 em dashes in interface strings | 1 |  |
| 21 | CP-05 | P1 | src/pages/index.astro:59 | Dash sprinkle: 3 em dashes in interface strings | 1 |  |
| 22 | CP-10 | P1 | dist/circles/front-end/index.html:1 | Arrow glyphs stapled to labels: right-pointing arrow in Arabic text (forward is ←) | 2 | Phase 1 → Core Engineering → إطار عمل تخصصي |
| 23 | CP-10 | P1 | dist/index.html:7 | Arrow glyphs stapled to labels: right-pointing arrow in Arabic text (forward is ←) | 1 | Phase 1 → Core Engineering → إطار عمل تخصصي |
| 24 | IG-09 | P1 | dist/circles/flutter/index.html | Layout-shifting media: first image is lazy-loaded (a likely LCP image) | 1 | <img src="/upstream/flutter/Banner.png" alt="Flutter" loading="lazy" class="aspect-video w-full obje |
| 25 | IG-09 | P1 | dist/circles/front-end/index.html | Layout-shifting media: first image is lazy-loaded (a likely LCP image) | 1 | <img src="/upstream/front-end/roadmap_bg.png" alt="Front End" loading="lazy" class="aspect-video w-f |
| 26 | IG-11 | P1 | dist/circles/flutter/index.html:1 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content="Astro v7.4.2"> |
| 27 | IG-11 | P1 | dist/circles/front-end/index.html:1 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content="Astro v7.4.2"> |
| 28 | IG-11 | P1 | dist/index.html:1 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content="Astro v7.4.2"> |
| 29 | IG-11 | P1 | dist/start-flutter/index.html:1 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content="Astro v7.4.2"> |
| 30 | IG-11 | P1 | dist/start-front-end/index.html:1 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content="Astro v7.4.2"> |
| 31 | IG-11 | P1 | src/layouts/Layout.astro:23 | Generator fingerprints: generator fingerprint | 1 | <meta name="generator" content={Astro.generator} /> |
| 32 | LA-20 | P1 | dist/start-flutter/index.html:6 | Viewport units that jump: h-screen (use svh/dvh) | 1 | max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-85 max-lg:max-w-[85vw] max-lg:translate-x-full max-lg:overflow-y-auto max-lg:rounded-none max- |
| 33 | LA-20 | P1 | src/pages/start-[id].astro:99 | Viewport units that jump: h-screen (use svh/dvh) | 1 | max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-85 max-lg:max-w-[85vw] max-lg:translate-x-full max-lg:overflow-y-auto max-lg:rounded-none max- |
| 34 | MO-03 | P1 | dist/index.html:7 | `transition: all`: transition-all | 2 | h-full rounded-full transition-all duration-300 |
| 35 | MO-03 | P1 | src/components/CircleCard.astro:42 | `transition: all`: transition-all | 1 | h-full rounded-full transition-all duration-300 |
| 36 | QA-02 | P1 | dist/circles/flutter/index.html:5 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 37 | QA-02 | P1 | dist/circles/front-end/index.html:5 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 38 | QA-02 | P1 | dist/index.html:7 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 39 | QA-02 | P1 | dist/start-flutter/index.html:6 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 40 | QA-02 | P1 | dist/start-front-end/index.html:6 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 41 | QA-02 | P1 | src/components/SearchModal.astro:8 | No visible focus: outline-none without focus-visible here | 1 | w-full bg-transparent text-sm outline-none placeholder:text-muted |
| 42 | SC-05 | P1 | dist/circles/flutter/index.html:4 | Missing direction, or physical CSS in RTL: text-align: left in an RTL project (use start/end) | 1 | .prose-raw[data-astro-cid-w5oi4ovb] pre |
| 43 | SC-05 | P1 | dist/circles/front-end/index.html:4 | Missing direction, or physical CSS in RTL: text-align: left in an RTL project (use start/end) | 1 | .prose-raw[data-astro-cid-w5oi4ovb] pre |
| 44 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical left in an RTL project (use the logical property) | 8 | .react-flow__handle-bottom |
| 45 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-right in an RTL project (use the logical property) | 2 | .react-flow__controls.horizontal .react-flow__controls-button |
| 46 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-left-width in an RTL project (use the logical property) | 1 | .react-flow__resize-control.line.left |
| 47 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-right-width in an RTL project (use the logical property) | 1 | .react-flow__resize-control.line.right |
| 48 | SC-05 | P1 | dist/start-flutter/index.html:6 | Missing direction, or physical CSS in RTL: physical utilities in an RTL project: max-lg:right-0 | 1 | max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-85 max-lg:max-w-[85vw] max-lg:translate-x-full max-lg:overflow-y-auto max-lg:rounded-none max- |
| 49 | SC-05 | P1 | dist/start-front-end/index.html:6 | Missing direction, or physical CSS in RTL: physical utilities in an RTL project: max-lg:right-0 | 1 | max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-85 max-lg:max-w-[85vw] max-lg:translate-x-full max-lg:overflow-y-auto max-lg:rounded-none max- |
| 50 | SC-05 | P1 | src/pages/circles/[id].astro:83 | Missing direction, or physical CSS in RTL: text-align: left in an RTL project (use start/end) | 1 | .prose-raw :global(pre) |
| 51 | SC-05 | P1 | src/pages/start-[id].astro:99 | Missing direction, or physical CSS in RTL: physical utilities in an RTL project: max-lg:right-0 | 1 | max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-85 max-lg:max-w-[85vw] max-lg:translate-x-full max-lg:overflow-y-auto max-lg:rounded-none max- |
| 52 | TY-04 | P1 | dist/index.html:7 | One accented word in the headline: one word styled differently inside the headline | 1 | رحلتك التعليمية كاملة<span class="bg-gradient-to-l from-accent to-accent-2 bg-clip-text te |
| 53 | TY-04 | P1 | src/pages/index.astro:36 | One accented word in the headline: one word styled differently inside the headline | 1 |  رحلتك التعليمية كاملة <span class="bg-gradient-to-l from-accent to-accent-2 bg-clip-text  |
| 54 | CO-07 | P2 | src/styles/global.css:23 | Halos, spotlights and blobs: radial halo or spotlight background | 1 | radial-gradient(1200px 500px at 85% -10%, color-mix(in oklab, var(--color-accent) 7%, transparent), transparent 60%),     radial-gradient(900px 420px at 10% 110 |
| 55 | CP-09 | P2 | dist/start-flutter/index.html:6 | Apologetic or vague errors: "oops" | 1 | Practice string operations and understand control flow using conditionals and lo |
| 56 | IG-09 | P2 | dist/circles/flutter/index.html | Layout-shifting media: 1 <img> without width/height | 1 | <img src="/upstream/flutter/Banner.png" alt="Flutter" loading="lazy" class="aspect-video w-full obje |
| 57 | IG-09 | P2 | dist/circles/front-end/index.html | Layout-shifting media: 1 <img> without width/height | 1 | <img src="/upstream/front-end/roadmap_bg.png" alt="Front End" loading="lazy" class="aspect-video w-f |
| 58 | QA-12 | P2 | dist/circles/flutter/index.html | No skip link: no skip link to the main content | 1 |  |
| 59 | QA-12 | P2 | dist/circles/front-end/index.html | No skip link: no skip link to the main content | 1 |  |
| 60 | QA-12 | P2 | dist/index.html | No skip link: no skip link to the main content | 1 |  |
| 61 | QA-12 | P2 | dist/start-flutter/index.html | No skip link: no skip link to the main content | 1 |  |
| 62 | QA-12 | P2 | dist/start-front-end/index.html | No skip link: no skip link to the main content | 1 |  |
| 63 | QA-14 | P2 | dist/circles/flutter/index.html | Theme metadata mismatch: no <meta name="theme-color"> | 1 |  |
| 64 | QA-14 | P2 | dist/circles/front-end/index.html | Theme metadata mismatch: no <meta name="theme-color"> | 1 |  |
| 65 | QA-14 | P2 | dist/index.html | Theme metadata mismatch: no <meta name="theme-color"> | 1 |  |
| 66 | QA-14 | P2 | dist/start-flutter/index.html | Theme metadata mismatch: no <meta name="theme-color"> | 1 |  |
| 67 | QA-14 | P2 | dist/start-front-end/index.html | Theme metadata mismatch: no <meta name="theme-color"> | 1 |  |
| 68 | SY-04 | P2 | dist/index.html:5 | No layering scale: z-index 1001 | 1 | svg.react-flow__connectionline |

Judged findings (eye) are added by the reviewer below this line and labelled as judgment.
