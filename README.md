# مسارات CAT Reloaded — موقع الكورسات

موقع static تفاعلي لعرض مسارات مجتمع [CATReloaded-Circles-Roadmaps](https://github.com/CATReloaded/CATReloaded-Circles-Roadmaps) مع تتبّع تقدّم محلي. المواصفة الكاملة في [PLAN.md](./PLAN.md) (اتفقنا عليها في جلسة grilling).

## الأوامر

```bash
npm install            # مرة واحدة (npm cache جوه الـ workspace تلقائيًا في هذه البيئة)
npm run dev            # خادم تطوير
npm run build          # astro build + pagefind (فهرس البحث)
npm run preview        # معاينة نسخة الإنتاج
npm run convert        # تحديث data الـ flagships من الـ clone المحلي (.roadmap-repo)
npm run vendor         # تجيب المحتوى الخام + الصور من الـ clone للمسارات غير المنظّمة
npm run gen:schema     # إعادة توليد content/circles.schema.json للمحرر
```

## الشجرة

```
content/circles/*.json    ← data الموحّدة (Zod schema — شوف content/circles.schema.json للـ autocomplete)
src/content/raw/          ← markdown خام من upstream (بيتولّد من npm run vendor)
public/upstream/          ← صور الـ upstream المستخدمة في الصفحات الخام
src/lib/content.ts        ← loader بيتحقق من الـ schema وقت الـ build
src/lib/progress.ts       ← ProgressStore (localStorage) — نقطة الاستبدال بـ backend لاحقًا
src/components/graph/     ← جزر React Flow (شبكة المسارات + تفاصيل المسار)
scripts/convert.ts        ← upstream Markdown → JSON drafts (بعدها تظبط يدوي و commit)
scripts/vendor.ts         ← نسخ المحتوى الخام + إعادة كتابة مسارات الصور + SOURCES.json
content/SOURCES.json      ← provenance: upstream commit وتاريخ الجلب وعدّادات كل مسار
```

## طريقة تحديث المحتوى

1. حدّث الـ clone المحلي: `git -C .roadmap-repo pull`
2. `npm run convert` — بيولّد drafts للـ flagships → راجّع/ظبّط الـ JSON يدويًا.
3. `npm run vendor` — للمسارات الخام (أي محتوى خارجي بيتجاب يدويًا بهالطريقة، مفيش fetch وقت build).
4. commit + `npm run build`.

## ملاحظات

- البحث (Pagefind) بيتفهرس فقط بعد `npm run build` — في `dev` هتلاقي رسالة توضيح.
- `d80fb293d…` هو upstream commit اللي اتبني عليه حاليًا — موجود في `content/SOURCES.json`.
- **إذن CATReloaded مطلوب قبل أي نشر عام** — upstream بدون ملف LICENSE.
