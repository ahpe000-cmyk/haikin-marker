/**
 * ログインの固定情報（docs/DECISIONS.md 14-1）。
 * あいことば（4桁）はここには書かない。実際のパスワードは
 * 「4桁 + PASSWORD_SUFFIX」で、Supabase側にのみハッシュとして存在する。
 * メールアドレスは形式上のもの（実在しない。メールは一切送られない）。
 */

export const PASSWORD_SUFFIX = "-atama-taiso";

export const LOGIN_PEOPLE = [
  {
    key: "otousan",
    label: "おとうさん",
    email: "otousan@atama-taiso.example.com",
    role: "senior",
  },
  {
    key: "okaasan",
    label: "おかあさん",
    email: "okaasan@atama-taiso.example.com",
    role: "senior",
  },
  {
    key: "mimamori",
    label: "みまもり",
    email: "mimamori@atama-taiso.example.com",
    role: "watcher",
  },
] as const;

export type LoginPerson = (typeof LOGIN_PEOPLE)[number];
