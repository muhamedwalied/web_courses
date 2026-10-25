# Copy tells (`CP-`)

These tells apply to **interface text the agent writes**: headings it drafted, labels, buttons, errors, empty states, alt text, metadata. Content the owner supplied (their prose, a poem, a quote, a product description they wrote) is never rewritten. If an owner's text contains a tell, mention it at most once, and never change it.

The scanner looks for the phrase lists in `scripts/data/copy-tells.json` in string literals, JSX text, `aria-*`, `alt` and `title` attributes, and `<meta>` content. It reports the hits as candidates: a person or the agent then decides whether the text was agent-written.

### CP-01 · Vague aspirational headline · P1 · scan eye
"Build the future of work", «ارتقِ بأعمالك إلى مستوى جديد».
**Fix:** say what the product does, for whom, in words a customer would use. Be specific rather than clever.
**Sources:** AD IM AS HM

### CP-02 · Buzzwords and superlatives · P1 · scan
English: *seamless, effortless, powerful, revolutionary, next-generation, cutting-edge, supercharge, unlock, elevate, empower, game-changer, delve, leverage, robust.*
Arabic: «حلول مبتكرة»، «تجربة استثنائية»، «نقلة نوعية»، «بكل سهولة ويسر»، «بضغطة زر»، «الإبداع بلا حدود»، «نصنع الفرق»، «رحلة» (for anything that is not a trip).
**Fix:** replace the claim with the fact behind it (a number, a feature, a result) or cut it.
**Sources:** AD GS IM AS T

### CP-03 · "Not X, but Y" cadence · P1 · scan
"It's not just a tool. It's a movement." / «ليس مجرد تطبيق، بل أسلوب حياة» / «لا يقتصر الأمر على… بل يمتد إلى…».
**Why:** machine prose leans on staged contrast to sound profound.
**Fix:** state the positive claim once.
**Sources:** GS IM AS T

### CP-04 · Tricolon slogans · P2 · scan
"Fast. Simple. Secure." / «سريع. آمن. موثوق.»
**Sources:** AD

### CP-05 · Dash sprinkle · P1 · scan
Em dashes in interface copy, one or more per sentence. In Arabic the em dash is rare in natural writing, so its presence is a strong tell.
**Fix:** commas, full stops or a restructured sentence. Keep dashes for ranges (with an en dash) and for the owner's own prose.
**Allowed:** long-form editorial copy where the author uses dashes.
**Sources:** IM GS AS T

### CP-06 · Generic action labels · P2 · scan
"Get started", "Learn more", "Submit", "Click here", «اضغط هنا», «إرسال» on every form.
**Fix:** name the result: "Book a session", «احجز جلسة», «أرسل الرسالة». Keep the same verb through the flow ("Publish" → "Published").
**Sources:** AD WG FD

### CP-07 · Invented facts · P0 · scan eye
Metrics, customer counts, ratings, testimonials, logos, awards or "as seen in" lines that the user did not supply; "fabricated precision" such as `$1,842,000` or "98.7%".
**Fix:** use real, supplied facts, or remove the element. Where a design needs a figure before the real one exists, show a labelled gap («يُعلن قريباً», "to be confirmed") rather than a fake.
**Sources:** HM GS AS IM

### CP-08 · Placeholder text · P0 · scan
Lorem ipsum, "John Doe", "Acme Inc.", «فلان الفلاني», "Your tagline here", `example.com` in visible copy, and empty "Coming soon" sections used as filler.
**Sources:** GS AD HM IM

### CP-09 · Apologetic or vague errors · P2 · scan
"Oops! Something went wrong", «عذراً، حدث خطأ ما!».
**Fix:** say what happened, what was kept, and what to do next, in the interface's voice. Errors do not apologise, and they are never vague.
**Sources:** GS FD

### CP-10 · Arrow glyphs stapled to labels · P2 · scan
"Learn more →". In RTL, an arrow pointing right is backwards.
**Fix:** drop the arrow, or use an icon that mirrors with direction (SC-06). In Arabic, forward is `←`.
**Sources:** AD T

### CP-11 · Case by habit · P2 · eye
Title Case Everywhere in English interface text.
**Decision:** tasmeem defaults to sentence case unless the brand's style guide says otherwise. Scripts without case skip this tell.
**Sources:** AD (the Vercel guidelines prefer Title Case; tasmeem follows the brand)

### CP-12 · The same words repeated in one block · P2 · render
The same label or phrase appearing in several slots of one card or row.
**Sources:** IM

### CP-13 · Emoji as icons or bullets · P1 · scan
✅ 🚀 ✨ used as list bullets, feature icons or navigation.
**Fix:** one icon family, or plain text.
**Allowed:** a chat-native or playful brand, sparingly.
**Sources:** AD GS HM TS

### CP-14 · Stock names · P2 · scan
Startup-cliché product names and placeholder people in demos.
**Sources:** HM

### CP-15 · Translation-shaped copy · P1 · eye
Copy that reads like a literal translation from English. Arabic examples:
- «قم بالنقر» for «انقر», and «قم بتسجيل الدخول» for «سجّل الدخول»;
- «يتم + masdar» passives, such as «يتم تحميل الملف»;
- «يلعب دوراً مهماً»;
- «في نهاية اليوم»;
- «هل أنت مستعد لـ…؟».
**Fix:** write in the language first. Direct imperatives; active verbs.
**Sources:** T

### CP-16 · Stacked connectors · P2 · scan
«بالإضافة إلى ذلك»، «علاوة على ذلك»، «ومن ناحية أخرى»، «حيث» used as an all-purpose link; "Additionally", "Moreover", "Furthermore" opening consecutive sentences.
**Sources:** AS T

## Per-language notes

Detailed lists live in `scripts/data/copy-tells.json` and in each `scripts-lang/` guide. In brief:

- **Arabic (ar):**
  - opening clichés: «في عالمٍ يتسارع…», «في ظل التطور التقني…», «لم يعد… مجرد…»;
  - inflated imperatives: «ارتقِ»، «انطلق نحو»، «اكتشف عالماً من»;
  - number–noun agreement errors, «3 ملف» for «3 ملفات» (use `Intl.PluralRules('ar')`, which has six categories);
  - mixing MSA with dialect in one sentence;
  - random tashkeel;
  - Latin `,` `?` `;` instead of «، ؟ ؛».
- **English (en):** "In today's fast-paced world", "Whether you're X or Y", "Say goodbye to", "the ultimate", "Ready to…?", rhetorical questions in headings.
- **Persian (fa):**
  - «راهکارهای نوآورانه»، «تجربه‌ای بی‌نظیر»، «به سادگی»، «فقط با یک کلیک»، «نسل جدید»;
  - staged contrast «نه تنها… بلکه…»;
  - Arabic ي/ك typed instead of Persian ی/ک, and a missing ZWNJ (نیم‌فاصله), which are script defects (SC-09).
