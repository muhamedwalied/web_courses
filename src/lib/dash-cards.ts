import { progressStore } from './progress';

/**
 * رسّام حالة كروت المسارات داخل الداشبورد — نفس عقد data-attributes
 * بتاع كروت الموقع العام (data-topic-keys / data-bar / data-pct)
 * مع زر CTA بيتغير نصه حسب التقدّم: ابدأ ← استكمال ← مراجعة.
 */
export function paintCircleCard(el: HTMLElement): { done: number; total: number } {
  const keys: string[] = JSON.parse(el.dataset.topicKeys ?? '[]');
  const total = keys.length;
  const done = progressStore.countDone(keys);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const bar = el.querySelector<HTMLElement>('[data-bar]');
  const label = el.querySelector<HTMLElement>('[data-pct]');
  const cta = el.querySelector<HTMLElement>('[data-cta]');

  if (bar) bar.style.width = `${pct}%`;
  if (label) label.textContent = `${done}/${total}`;
  if (cta) cta.textContent = done === 0 ? 'ابدأ المسار' : done === total ? 'مراجعة المسار' : 'استكمال';

  return { done, total };
}
