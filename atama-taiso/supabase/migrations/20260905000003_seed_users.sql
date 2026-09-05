-- 利用者3名の初期登録（父・母 = senior、見守り = watcher）
-- 表示名に実在の個人名は使わない（CLAUDE.md §16）。
-- auth_user_id は「はじめる」画面（4桁あいことば）での初回ログイン時に紐付く。

insert into users (id, display_name, role) values
  ('a0000000-0000-4000-8000-000000000001', 'おとうさん', 'senior'),
  ('a0000000-0000-4000-8000-000000000002', 'おかあさん', 'senior'),
  ('a0000000-0000-4000-8000-000000000003', 'みまもり',   'watcher')
on conflict (id) do nothing;

insert into watch_links (watcher_id, senior_id) values
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002')
on conflict do nothing;
