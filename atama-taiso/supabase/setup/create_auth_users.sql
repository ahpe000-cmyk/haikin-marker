-- 初期利用者3名の認証アカウント作成（セットアップ時に1回だけ実行する）
-- ※ これはマイグレーションではない。あいことばを含むため、実行時に
--    {{AIKOTOBA}} を実際の4桁に置き換えてSQLエディタ等で実行する。
--    置き換えたSQLをファイルやチャットに残さないこと（掟3）。
-- パスワードは「4桁 + '-atama-taiso'」（src/lib/login.ts の PASSWORD_SUFFIX と一致させる）

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'otousan@atama-taiso.example.com',
   extensions.crypt('{{AIKOTOBA}}-atama-taiso', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'okaasan@atama-taiso.example.com',
   extensions.crypt('{{AIKOTOBA}}-atama-taiso', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000003',
   'authenticated', 'authenticated', 'mimamori@atama-taiso.example.com',
   extensions.crypt('{{AIKOTOBA}}-atama-taiso', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values
  (gen_random_uuid(), 'b0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   '{"sub":"b0000000-0000-4000-8000-000000000001","email":"otousan@atama-taiso.example.com","email_verified":true}',
   'email', now(), now(), now()),
  (gen_random_uuid(), 'b0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
   '{"sub":"b0000000-0000-4000-8000-000000000002","email":"okaasan@atama-taiso.example.com","email_verified":true}',
   'email', now(), now(), now()),
  (gen_random_uuid(), 'b0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003',
   '{"sub":"b0000000-0000-4000-8000-000000000003","email":"mimamori@atama-taiso.example.com","email_verified":true}',
   'email', now(), now(), now());

-- アプリ側の利用者行と紐付け
update public.users set auth_user_id = 'b0000000-0000-4000-8000-000000000001'
  where id = 'a0000000-0000-4000-8000-000000000001';
update public.users set auth_user_id = 'b0000000-0000-4000-8000-000000000002'
  where id = 'a0000000-0000-4000-8000-000000000002';
update public.users set auth_user_id = 'b0000000-0000-4000-8000-000000000003'
  where id = 'a0000000-0000-4000-8000-000000000003';

-- あいことばを変えたい時（同じく {{AIKOTOBA}} を置き換えて実行）:
-- update auth.users set encrypted_password =
--   extensions.crypt('{{AIKOTOBA}}-atama-taiso', extensions.gen_salt('bf'))
--   where email like '%@atama-taiso.example.com';
