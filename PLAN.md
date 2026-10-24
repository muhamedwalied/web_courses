# PLAN — موقع مسارات CAT Reloaded

> الفهم المشترك المتفق عليه في جلسة الـ grilling (2026-10-24). المصدر: https://github.com/CATReloaded/CATReloaded-Circles-Roadmaps (commit `d80fb293d83d51123071ead8a8151bc0e5d9686b`).

## الهدف

موقع كورسات حقيقي يعرض مسارات (Roadmaps) مجتمع CAT Reloaded مع تتبّع تقدّم — browsing عام بدون حسابات.

## القرارات المحسومة

| # | القرار | الاختيار |
|---|--------|----------|
| 1 | نوع المنتج | Hybrid: الـ roadmap هو واجهة التصفح، والتقدّم طبقة فوقه (بدون accounts) |
| 2 | طبيعة المشروع | منتج حقيقي — مش demo |
| 3 | لغة الواجهة | عربي RTL (chrome عربي)، محتوى الـ roadmaps يفضل إنجليزي زي ما هو |
| 4 | الهوية البصرية | Dark technical — dark canvas، node edges متوهّجة |
| 5 | الـ Stack | Astro + Tailwind CSS 4 + React Flow island — Static بالكامل |
| 6 | التغطية (v1) | كل الـ 15 circle موجودين؛ Flutter + Front End structured بالكامل، الباقي Markdown + banner «قيد الإعداد» |
| 7 | عرض المسارات | شبكة (node graph) على مستويين: الرئيسية = circles + edges الـ prerequisites؛ صفحة الـ circle = levels/modules مع drill-down |
| 8 | مكتبة الشبكة | `@xyflow/react` (React Flow) |
| 9 | البيانات | `content/*.json` بـ schema موحّد، مكتوبة يدوياً، و Zod validation وقت الـ build، `id` مستقر لكل topic |
| 10 | إنتاج البيانات | سكريبت converter يولّد draft من ملفات upstream، وم novim يظبط الناتج يدوياً |
| 11 | التقدّم | checkbox لكل topic في `localStorage` + rollups تلقائية (module/level/circle)، عبر واجهة `ProgressStore` قابلة للاستبدال بـ backend لاحقاً |
| 12 | البحث | Pagefind (static، بعد الـ build) |
| 13 | النشر | Cloudflare Pages |
| 14 | المصادر الخارجية | أي محتوى مستضاف برّة الريبو (submodule الـ Cloud Computing، Notion links، repos خارجية) بيتجاب جوه يدوياً. مفيش أي fetch خارجي وقت الـ build. الفيديوهات (YouTube وأمثالها) بتتعمل embed جوه الموقع كـ facade خفيف وقت التشغيل؛ اللي مش قابل للـ embed يفضل outbound link |
| 15 | الـ git | كل خطوة محفوظة بـ commit منظم |
| 16 | الوثوقية | `content/SOURCES.json` يوثّق upstream SHA وأي محتوى vendored يدوياً |

## Schema الموحّد

```
Circle  { id, name, tagline, description, icon?, color, prereqs: circleId[],
          status: structured | raw, upstream: { paths[] }, levels[], cover? }
Level   { id, name, order, durationText?, modules[] }
Module  { id, name, order, topics[] }
Topic   { id, title, resources[], optional? }
Resource{ title, url, kind: video|article|docs|book|repo|other,
          lang: ar|en, embed?: boolean }
```

- `structured`: للصفحة الافتراضية الموحّدة (graph + تقدّم).
- `raw`: يعرض من الـ Markdown الجاي من `src/content/raw/<circle>/` (ملاحظة تنفيذية: لازم يكون جوه `src/` — Astro 7 مبيعملش glob لملفات `.md` برّه `src/`) مع banner «قيد الإعداد».
- `prereqs` بتغذّي edges شبكة الرئيسية.

## حقائق عن المصدر (من التحقيق)

- 15 circle، محتوى 100% Markdown بدون schema أو IDs أو license — **مطلوب إذن من CATReloaded قبل أي نشر عام** (على المستخدم).
- 5 dialects مختلفة للعناوين؛ مفيش فهرس موحّد.
- `Front End/Readme.md` مش UTF-8 (CP1256 + mojibake) — ناحتاجه؛ ملفات `roadmap-*.md` نضيفة.
- `Flutter` أنضف هيكلة: 24 ملف `week_NN.md` على 3 مستويات.
- الـ repo هادي منذ 2026-02-24؛ `NodeJS` يشاور على `data/roadmap.yaml` مش موجود أصلاً.
- الـ submodule `Cloud-Computing-RoadMap` (MIT) فاضي في الـ clone ويُجاب يدوياً عند الحاجة.

## خارج نطاق v1

accounts، backend، dashboard، git-sync، certificates، admin، CMS، i18n switcher.

## ترتيب التنفيذ

1. git init + هذا الملف
2. Scaffold (Astro + Tailwind + React)
3. Schema + loader + JSON $schema
4. Converter + Flutter & Front End + stubs للـ 13
5. Layout (RTL/dark/fonts)
6. الرئيسية: grid + شبكة circles
7. صفحة الـ circle: structured graph + raw fallback
8. ProgressStore
9. Pagefind
10. SOURCES.json + صور
11. build نهائي + smoke verification
