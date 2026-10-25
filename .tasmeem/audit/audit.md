# Audit · cat-roadmaps (src/ + dist/) · 2026-10-25

Measured: scan ✓ (13 ملف) · built ✓ (5 صفحات) · render ✗ (Playwright غير متاح في المشروع — اختياري)

## بعد الإصلاح (دفعة واحدة 2026-10-25 · ول dataset نفسه)

**قبل:** P0 10 · P1 43 · P2 15 → **بعد:** **P0 0 · P1 4 · P2 0** · brand exceptions 26 (DESIGN.md أساسه الآن نظام التسجيل).

المُصلح فعليًا: حلقة `:focus-visible` عامة · theme-color · skip link منطقي (`start-4`) · صور الغلاف eager + width/height · `pre` منطقي (`direction: ltr; text-align: start`) · drawer `start-0` · sidebar `h-dvh` · `transition-[width]` · فصل سهم الـ tagline المُرندر (← اتجاه RTL) عن سهم المحتوى المالك · حذف التفريغ من قفلين لاتينيين (رفض tasmeem استثناء SC-01 إطلاقًا — القاعدة سليمة) · `outline-none` اتشال من إنبت البحث.

المتبقي 4 P1 = physical CSS **داخل مكتبة @xyflow/react نفسها** (الـ canvas بتاعة شبكة المسارات في الرئيسية) — ثالثة لا تُصلّح بدون fork ولا تُستثنى (tasmeem يمنع استثناء SC-05 بالتصميم). موثقة مثلها في DESIGN.md (مع SY-04/CP-09).

الـ verdict الرسمي يفضل FAIL في نصه الآلي بسبب تلك الـ 4 Third-party — كل ما هو ملك المشروع نضيف P0/P1/P2.

Raw totals: P0 10 · P1 43 · P2 15 → بعد التحكيم والتجميع (dedup + تصنيف):

**الإجماليات بعد التحكيم: قضايا حقيقية 9 · استثناءات هوية 6 · محتوى المالك (مستثنى من الحكم) 2 · false positive 1**

## قضايا حقيقية (اقتراح إصلاح — لا شيء اتعدل لحد ما تختار)

| # | ID | Sev | فين | الملاحظة | الإصلاح | الحكم |
|---|----|-----|-----|----------|---------|-------|
| 1 | QA-02 | **P0** | global.css (عام) + SearchModal | مفيش `:focus-visible` أي مكان — تنقّل الكيبورد أعمى تمامًا | ring عندنا في global.css: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` + سطر focus-ring للإنبت | measured ×7 |
| 2 | SC-01 | **P0** | Layout.astro:36 · index.astro:35 · كل صفحة (chip/counts سطر «مستويات/موضوع/مصادر») | `tracking-wide`/`tracking-widest` على نص عربي — التفريغ بيقطّع اتصال الحروف | شيل الـ tracking من العناصر اللي فيها عربي؛ يفضل بس على mono لاتيني (`dir="ltr"` زي الـ crumb) | measured ×7 |
| 3 | IG-09 | P1 | CircleIntro.astro (cover الصورتين) | صورة الغلاف (اللي غالبًا LCP) `loading="lazy"` + من غير width/height → CLS وبطء أول رسم | `loading="eager" fetchpriority="high"` + width/height صريحين | measured |
| 4 | SC-05 | P1 | circles/[id].astro:83 | `.prose-raw pre { text-align: left }` — physical justify: الكود لاتيني فالمحاذاة يسار صحيحة القصد، بس الأصح logical: `dir="ltr"` على `pre` + `text-align: start` | كده الكود يفضل يسار وكل لغة تانية تاخد start صح | measured |
| 5 | SC-05 | P1 | start-[id].astro:99 | الـ drawer `max-lg:right-0` — physical؛ الرأي الصحيح المنطقي `start-0` (في RTL start = يمين = نفس النتيجة بالظبط) | استبدال right-0 بـ start-0 | measured |
| 6 | LA-20 | P1 | start-[id].astro:99 | `h-screen` على الـ sidebar — شريط عنوان المتصفح في iOS بيخلّيها تقفز | `h-dvh` (مدعومة في Tailwind 4) بدل h-screen | measured |
| 7 | MO-03 | P1 | CircleCard.astro:42 | `transition-all` — أعلى تكلفة وبتشمل كل الخصائص | تحديد الخصائص فعليًا: `transition-[color,background-color,border-color,transform]` أو transition-colors | measured |
| 8 | QA-12 | P2 | Layout.astro | مفيش skip link للمحتوى الرئيسي | رابط «تجاوز إلى المحتوى» أول حاجة في الـ body | measured |
| 9 | QA-14 | P2 | Layout.astro | مفيش `<meta name="theme-color">` (شريط المتصفح فاتح على خلفية داكنة) | `<meta name="theme-color" content="#0a0e14">` | measured |

## استثناءات هوية (قصد مصمم — تتسجل في DESIGN.md بدل ما نصلحها)

| # | ID | الملخص | ليه استثناء |
|---|----|---------|-------------|
| 10 | CO-05 + TY-04 | الكلمة المميزة بالـ gradient في هيرو الرئيسية («رحلتك التعليمية كاملة…») | توقيع بصري مقصود ومتكرر كعنصر واحد بس — مش نمط عمومي؛ تبقى تسجيل هوية |
| 11 | CO-07 | توهينتين radial خفيفين (7% و6%) في خلفية الـ body | العمق المحسوس للهوية الداكنة — خفيف جدًا على إنه halo marketing |
| 12 | CM-03 | `backdrop-blur` على الهيدر الثابت | وظيفي (قراءة الهيدر فوق محتوى متحرك) مش ديكور زجاج |
| 13 | SC-05 | physical props جوه CSS مكتبة @xyflow/react (المقابض/أزرار التكبير) | كود مصدر خارجي (@xyflow/react) — مش من شغلتنا؛ مفيش إصلاح من غير fork |
| 14 | CO-16 | ألوان خام في CirclesGraph | ألوان ديناميكية من بيانات المسارات نفسها (`circle.color`) — data tokens مش escape من النظام |
| 15 | IG-11 | `<meta name="generator" content="Astro">` | صدق عن الـ stack — لو حبيت نشيله لاحقًا قرار منفصل |

## محتوى المالك (مقدَّس — مش بيتحاكم عليه)

- CP-02 «The Ultimate React Course» وغيره: عناوين كورسات من محتوى الـ upstream.
- CP-05 الشرطات (—/-) اللي وسط عناوين الكورسات والمواضيع وموارد الـ payload.

## خطأ قياس (false positive)

- CP-09 «oops» في صفحة flutter — ده جوه كلمة **lo**ops في نص إنجليزي للمحتوى. متلغي.

## أحسن 3 إصلاحات (الأعلى أثرًا)

1. **حلقة التركيز العالمية (#1)** — تصليح وصول P0 واحد يطال كل الأزرار/اللينكات/الإنبت في الموقع.
2. **حظر التفريغ على العربي (#2)** — أجمل حرفيًا فورًا: الحروف العربية هترجع متصلة في الـ chips والعدادات.
3. **صور الغلاف eager + width/height (#3)** — أسرع أول رسم وأقل قفز تخطيط على صفحتي المسارات.

## اللي شغال كويس (نحتفظ بيه)

- `dir/lang` صحيحين على الجذر، وخطوط عربية حقيقية (Noto Sans Arabic) مش fallback لاتيني — أشهر غلطتين في كتالوج مهارات الواجهات، والموقع سليم منهم.
- نظام توكنز واحد (`bg/panel/edge/ink/muted/accent`) وأغلب الألوان منه.
- `icon-flip` للأيقونات الاتجاهية + منطقية ms/me/ps/pe في أغلب الشغل الجديد.
- تسلسل السرد واضح ومقروء: هيرو → كارت → منهج → بحث، بدون قوالب الـ AI المعروفة (لا three-cards ولا pricing strip).
