-- 頭体操アプリ 初期スキーマ（CLAUDE.md §5 のとおり）

-- 利用者（父・母・見守り者）
create table users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,                         -- Supabase Auth との紐付け
  display_name  text not null,                       -- 「おとうさん」「おかあさん」等
  role          text not null check (role in ('senior','watcher')),
  line_user_id  text unique,                         -- LINE連携後に格納。未連携は null
  share_with_watcher boolean not null default false, -- 見守りON/OFF。本人のみ変更可
  streak_days   int not null default 0,
  last_active_on date,
  created_at    timestamptz not null default now()
);

-- 見守り関係（誰が誰を見られるか）
create table watch_links (
  watcher_id  uuid not null references users(id) on delete cascade,
  senior_id   uuid not null references users(id) on delete cascade,
  primary key (watcher_id, senior_id)
);

-- クイズ問題プール（事前生成・人が確認済のもののみ approved = true）
create table quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,   -- 'math' | 'history' | 'geography' | 'heritage' | 'general'
  question     text not null,
  choices      jsonb not null,  -- ["A","B","C","D"]
  answer_index int not null check (answer_index between 0 and 3),
  explanation  text,
  difficulty   int not null default 1 check (difficulty between 1 and 3),
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 毎朝のセッション
create table daily_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  session_date date not null,
  quiz_correct int,             -- 5問中の正解数。未実施は null
  memory_quiz_correct boolean,  -- 記憶クイズの正誤。出題なしは null
  effort_note  text,            -- きょう頑張ること
  completed_at timestamptz,
  unique (user_id, session_date)
);

-- クイズ回答履歴（同じ問題を近日中に再出題しないため）
create table quiz_answers (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references daily_sessions(id) on delete cascade,
  question_id  uuid not null references quiz_questions(id),
  is_correct   boolean not null,
  answered_at  timestamptz not null default now()
);

-- 食事記録（テキストのみ。写真は保存しない）
create table meals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  eaten_on     date not null,
  meal_type    text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  dish_name    text not null,           -- AI判定 or 本人入力
  ingredients  text[],                  -- AI判定の食材リスト
  source       text not null check (source in ('photo_ai','manual','memory_input')),
  confirmed    boolean not null default false,  -- 本人が「合っている」を押したか
  created_at   timestamptz not null default now()
);

-- 日記
create table diary_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  entry_date   date not null,
  done         text,           -- できたこと
  not_done     text,           -- できなかったこと
  tomorrow     text,           -- 明日やりたいこと
  updated_at   timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index on meals (user_id, eaten_on);
create index on daily_sessions (user_id, session_date);
create index on quiz_answers (session_id);
