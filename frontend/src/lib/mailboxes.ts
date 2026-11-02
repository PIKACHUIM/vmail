// 浏览器本地保存的邮箱列表：支持在首页切换多个临时邮箱
export type StoredMailbox = {
  address: string;
  mailboxToken: string;
  expiresAt: number;
};

const STORAGE_KEY = "vmail.mailboxes";
const MAX_ENTRIES = 20;
const KEEP_EXPIRED_MS = 7 * 24 * 60 * 60 * 1000;

function isEntry(value: unknown): value is StoredMailbox {
  if (!value || typeof value !== "object") return false;
  const box = value as Partial<StoredMailbox>;
  return (
    typeof box.address === "string" &&
    box.address.length > 0 &&
    typeof box.mailboxToken === "string" &&
    typeof box.expiresAt === "number" &&
    Number.isFinite(box.expiresAt)
  );
}

export function loadMailboxes(): StoredMailbox[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isEntry)
      .filter((box) => box.expiresAt + KEEP_EXPIRED_MS > Date.now())
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveMailboxes(list: StoredMailbox[]): StoredMailbox[] {
  const deduped = new Map<string, StoredMailbox>();
  for (const box of list) {
    if (!isEntry(box)) continue;
    const existing = deduped.get(box.address);
    if (!existing || existing.expiresAt < box.expiresAt) deduped.set(box.address, box);
  }
  const result = [...deduped.values()]
    .sort((a, b) => b.expiresAt - a.expiresAt)
    .slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // 隐私模式下 localStorage 可能不可用，忽略即可
  }
  return result;
}

export function upsertMailbox(
  list: StoredMailbox[],
  entry: StoredMailbox,
): StoredMailbox[] {
  return saveMailboxes([entry, ...list.filter((box) => box.address !== entry.address)]);
}

export function removeMailbox(
  list: StoredMailbox[],
  address: string,
): StoredMailbox[] {
  return saveMailboxes(list.filter((box) => box.address !== address));
}
