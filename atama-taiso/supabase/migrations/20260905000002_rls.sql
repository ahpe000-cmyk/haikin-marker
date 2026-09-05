-- RLS（CLAUDE.md §5 RLS（必須） のとおり）
-- 方針:
--  * senior は自分の行のみ読み書き
--  * watcher は watch_links で紐付いた senior の行を share_with_watcher = true の時だけ SELECT可。書き込み不可
--  * quiz_questions は認証済ユーザー全員が approved = true の行を SELECT可。書き込みは管理者（service_role）のみ
--  * share_with_watcher は本人のみ更新可（watcherが変更できるポリシーは書かない）
--  * 利用者行の作成・watch_links の管理は service_role（管理作業）のみ

-- ログイン中の auth ユーザーに対応する users.id を返す
create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid()
$$;

-- 指定の senior 行を、いまの利用者が見守りとして閲覧できるか
-- （紐付けあり かつ 本人が共有ON）
create or replace function public.can_watch(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.watch_links wl
    join public.users s on s.id = wl.senior_id
    where wl.watcher_id = public.current_app_user_id()
      and wl.senior_id = target_user_id
      and s.share_with_watcher = true
  )
$$;

alter table users          enable row level security;
alter table watch_links    enable row level security;
alter table quiz_questions enable row level security;
alter table daily_sessions enable row level security;
alter table quiz_answers   enable row level security;
alter table meals          enable row level security;
alter table diary_entries  enable row level security;

-- users ---------------------------------------------------------------
create policy users_select_own on users
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy users_select_watched on users
  for select to authenticated
  using (public.can_watch(id));

-- 本人のみ自分の行を更新できる（watcherが他人の行を更新できるポリシーは作らない）
create policy users_update_own on users
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- watch_links ---------------------------------------------------------
-- 自分が関係する紐付けだけ見える。作成・変更は管理（service_role）のみ
create policy watch_links_select_own on watch_links
  for select to authenticated
  using (
    watcher_id = public.current_app_user_id()
    or senior_id = public.current_app_user_id()
  );

-- quiz_questions ------------------------------------------------------
create policy quiz_questions_select_approved on quiz_questions
  for select to authenticated
  using (approved = true);

-- daily_sessions ------------------------------------------------------
create policy daily_sessions_own on daily_sessions
  for all to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

create policy daily_sessions_select_watched on daily_sessions
  for select to authenticated
  using (public.can_watch(user_id));

-- quiz_answers --------------------------------------------------------
create policy quiz_answers_own on quiz_answers
  for all to authenticated
  using (
    exists (
      select 1 from daily_sessions ds
      where ds.id = quiz_answers.session_id
        and ds.user_id = public.current_app_user_id()
    )
  )
  with check (
    exists (
      select 1 from daily_sessions ds
      where ds.id = quiz_answers.session_id
        and ds.user_id = public.current_app_user_id()
    )
  );

-- meals ---------------------------------------------------------------
create policy meals_own on meals
  for all to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

create policy meals_select_watched on meals
  for select to authenticated
  using (public.can_watch(user_id));

-- diary_entries -------------------------------------------------------
create policy diary_entries_own on diary_entries
  for all to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

-- 日記を見守り者へどこまで見せるかは判断待ち（docs/PENDING.md 14-2）。
-- 決定までは watcher 向けの日記SELECTポリシーを作らない（= watcherは日記を読めない）。
