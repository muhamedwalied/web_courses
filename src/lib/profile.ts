/**
 * الملف الشخصي المحلي v1 — بدون حسابات (اتفقنا 2026-10-29).
 * الاسم بيتحفظ على جهاز المستخدم فقط (localStorage) — لا سيرفر ولا ربط خارجي.
 * الجيت إلزامي: أي دخول للداشبورد بدون اسم يطلب الاسم أولًا (مفيش زر تخطي).
 * بثّ حدث "dash:profile" بعد كل تغيير — الـ chip والتحية بيسمعوه ويتحدّثوا.
 */

export interface Profile {
  name: string;
}

const STORAGE_KEY = 'cr:profile:v1';

export function getProfile(): Profile {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (raw && typeof raw.name === 'string') return { name: raw.name };
  } catch {
    /* JSON تالف أو وضع التصفح الخاص — نرجّع فاضي */
  }
  return { name: '' };
}

export function setName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name }));
  } catch {
    /* التخزين مرفوض — يكفي الوضع الحالي للجلسة */
  }
  window.dispatchEvent(new CustomEvent('dash:profile'));
}

/** أول حرف من الاسم لأفاتار الحرف: «medo» → M، «محمد» → م */
export function initialOf(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '';
  const first = [...trimmed][0];
  return first ? first.toUpperCase() : '';
}
