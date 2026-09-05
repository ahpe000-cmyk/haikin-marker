/** 日付はすべて日本時間（JST）基準で扱う */

const JST_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** きょうの日付（JST）を YYYY-MM-DD で返す */
export function todayJst(): string {
  return JST_FMT.format(new Date());
}

/** YYYY-MM-DD に日数を足す（負も可） */
export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** YYYY-MM-DD の曜日（日〜土） */
export function weekdayJa(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** 「9月5日（金）」の形式 */
export function formatJa(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}月${d}日（${weekdayJa(ymd)}）`;
}

/** 「2026年9月5日（金）」の形式 */
export function formatJaFull(ymd: string): string {
  const [y] = ymd.split("-").map(Number);
  return `${y}年${formatJa(ymd)}`;
}

/** JSTの現在時刻（0-23時） */
export function hourJst(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
}
