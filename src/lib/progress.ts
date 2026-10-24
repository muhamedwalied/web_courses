/**
 * ProgressStore — topic-level completion persisted in localStorage.
 *
 * The agreed v1 storage backend (no accounts). The UI only talks to this
 * module, so a server-backed implementation can replace it later without
 * touching components.
 *
 * Key format: "<circleId>/<levelId>/<moduleId>/<topicId>" — stable even if
 * topics are reordered (see topicKey in src/schemas/roadmap.ts).
 */

export type ProgressSnapshot = Record<string, 1>;

const STORAGE_KEY = 'cat-roadmaps:progress:v1';

function read(): ProgressSnapshot {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return raw && typeof raw === 'object' ? (raw as ProgressSnapshot) : {};
  } catch {
    return {};
  }
}

let snapshot: ProgressSnapshot = typeof localStorage !== 'undefined' ? read() : {};
const listeners = new Set<(s: ProgressSnapshot) => void>();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage full/blocked — progress stays in-memory for this session */
  }
}

export const progressStore = {
  snapshot: (): ProgressSnapshot => snapshot,
  isDone(key: string): boolean {
    return snapshot[key] === 1;
  },
  countDone(keys: string[]): number {
    let n = 0;
    for (const k of keys) if (snapshot[k] === 1) n++;
    return n;
  },
  toggle(key: string): void {
    if (snapshot[key] === 1) delete snapshot[key];
    else snapshot[key] = 1;
    persist();
    for (const l of listeners) l(snapshot);
  },
  /** subscribe to changes (same-tab toggles + cross-tab storage events) */
  subscribe(cb: (s: ProgressSnapshot) => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        snapshot = read();
        cb(snapshot);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  },
};

export const tkey = (circleId: string, levelId: string, moduleId: string, topicId: string): string =>
  `${circleId}/${levelId}/${moduleId}/${topicId}`;
