-- 14-2 決定（2026-09-05・花園）: 共有ONの時、日記は本文まで見守り者に見せる。
-- watcher は SELECT のみ（書き込みポリシーは作らない）。
-- can_watch() は「紐付けあり かつ 本人が共有ON」の時だけ true。

create policy diary_entries_select_watched on diary_entries
  for select to authenticated
  using (public.can_watch(user_id));
