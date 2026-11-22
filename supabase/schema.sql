-- NaraNusa MVP database foundation. Apply once to a new Supabase project.
-- Do not expose the service-role key to the browser. The client must not write scores directly.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'parent', 'teacher', 'admin')),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

-- New signups receive the student role. Privileged roles are assigned only by a trusted admin.
create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'student', coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_student_profile();

create table if not exists public.curriculum_sources (
  id text primary key,
  title text not null,
  publisher text not null,
  source_url text not null,
  edition text,
  evidence_note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  sort_order smallint not null default 0
);

create table if not exists public.topics (
  id text primary key,
  subject_id text not null references public.subjects(id),
  phase text not null default 'B',
  grade smallint not null default 4 check (grade between 3 and 6),
  chapter text not null,
  title text not null,
  objective text not null,
  source_ids text[] not null default '{}',
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  topic_id text not null references public.topics(id),
  question_type text not null default 'multiple-choice' check (question_type = 'multiple-choice'),
  stem text not null,
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) = 4),
  explanation text not null,
  source_ids text[] not null default '{}',
  source_locator text not null,
  publication_status text not null default 'draft' check (publication_status in ('draft', 'needs_review', 'published', 'rejected')),
  created_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Answer keys are isolated so student clients cannot fetch them with question content.
create table if not exists public.question_keys (
  question_id text primary key references public.questions(id) on delete cascade,
  answer_index smallint not null check (answer_index between 0 and 3),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.guardian_links (
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  relationship text not null default 'guardian',
  created_at timestamptz not null default now(),
  primary key (guardian_id, student_id),
  check (guardian_id <> student_id)
);

create table if not exists public.student_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0 and correct_answers <= attempts),
  streak_days integer not null default 0 check (streak_days >= 0),
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

-- Insert/scoring is reserved for a trusted server or Edge Function, not the student browser.
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  selected_index smallint not null check (selected_index between 0 and 3),
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id text primary key,
  title text not null,
  description text not null,
  icon_name text not null,
  is_published boolean not null default false
);

create table if not exists public.student_badges (
  student_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (student_id, badge_id)
);

create table if not exists public.daily_missions (
  id text primary key,
  mission_date date not null,
  title text not null,
  description text not null,
  subject_ids text[] not null default '{}',
  target_questions smallint not null default 4 check (target_questions > 0),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (mission_date, id)
);

create table if not exists public.student_missions (
  student_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null references public.daily_missions(id) on delete cascade,
  completed_questions smallint not null default 0 check (completed_questions >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, mission_id)
);

create table if not exists public.avatar_catalog (
  id text primary key,
  name text not null,
  description text not null default '',
  icon_name text not null,
  is_published boolean not null default false
);

create table if not exists public.student_avatar (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  avatar_id text not null references public.avatar_catalog(id),
  updated_at timestamptz not null default now()
);

create index if not exists topics_subject_status_idx on public.topics(subject_id, publication_status);
create index if not exists questions_topic_status_idx on public.questions(topic_id, publication_status);
create index if not exists attempts_student_created_idx on public.attempts(student_id, created_at desc);
create index if not exists student_missions_student_idx on public.student_missions(student_id);

alter table public.profiles enable row level security;
alter table public.curriculum_sources enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.guardian_links enable row level security;
alter table public.student_progress enable row level security;
alter table public.attempts enable row level security;
alter table public.badges enable row level security;
alter table public.student_badges enable row level security;
alter table public.daily_missions enable row level security;
alter table public.student_missions enable row level security;
alter table public.avatar_catalog enable row level security;
alter table public.student_avatar enable row level security;

-- Authenticated users can read published, non-sensitive learning content.
drop policy if exists "authenticated read subjects" on public.subjects;
create policy "authenticated read subjects" on public.subjects for select to authenticated using (true);
drop policy if exists "authenticated read sources" on public.curriculum_sources;
create policy "authenticated read sources" on public.curriculum_sources for select to authenticated using (true);
drop policy if exists "authenticated read published topics" on public.topics;
create policy "authenticated read published topics" on public.topics for select to authenticated using (publication_status = 'published');
drop policy if exists "authenticated read published questions" on public.questions;
create policy "authenticated read published questions" on public.questions for select to authenticated using (publication_status = 'published');
drop policy if exists "authenticated read published badges" on public.badges;
create policy "authenticated read published badges" on public.badges for select to authenticated using (is_published);
drop policy if exists "authenticated read active daily missions" on public.daily_missions;
create policy "authenticated read active daily missions" on public.daily_missions for select to authenticated using (is_active);
drop policy if exists "authenticated read published avatar catalog" on public.avatar_catalog;
create policy "authenticated read published avatar catalog" on public.avatar_catalog for select to authenticated using (is_published);

-- Profiles are private; guardians can view only linked student profiles.
drop policy if exists "read own or linked profiles" on public.profiles;
create policy "read own or linked profiles" on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = profiles.id and gl.guardian_id = auth.uid()
  )
);
-- No profile insert/update policy: signup trigger creates student profiles; role changes are admin-only.

-- Link visibility is limited to either participant. Creating a link is a trusted onboarding action.
drop policy if exists "read own guardian links" on public.guardian_links;
create policy "read own guardian links" on public.guardian_links for select to authenticated using (
  guardian_id = auth.uid() or student_id = auth.uid()
);

-- Guardian and student may read progress; no direct client writes to trusted score data.
drop policy if exists "read own or linked progress" on public.student_progress;
create policy "read own or linked progress" on public.student_progress for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = student_progress.student_id and gl.guardian_id = auth.uid()
  )
);
drop policy if exists "read own or linked attempts" on public.attempts;
create policy "read own or linked attempts" on public.attempts for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = attempts.student_id and gl.guardian_id = auth.uid()
  )
);
drop policy if exists "read own or linked earned badges" on public.student_badges;
create policy "read own or linked earned badges" on public.student_badges for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = student_badges.student_id and gl.guardian_id = auth.uid()
  )
);
drop policy if exists "read own or linked mission progress" on public.student_missions;
create policy "read own or linked mission progress" on public.student_missions for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = student_missions.student_id and gl.guardian_id = auth.uid()
  )
);
drop policy if exists "read own or linked avatar selection" on public.student_avatar;
create policy "read own or linked avatar selection" on public.student_avatar for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.guardian_links gl
    where gl.student_id = student_avatar.student_id and gl.guardian_id = auth.uid()
  )
);

-- Kunci jawaban hanya tersedia untuk guru/admin; never query from student client.
drop policy if exists "teacher admin read question keys" on public.question_keys;
create policy "teacher admin read question keys" on public.question_keys for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher', 'admin'))
);

-- No write policies are granted to authenticated browser clients for curriculum, keys,
-- attempts, scores, badges, or guardian links. Add a trusted server/Edge Function and
-- narrowly scoped policies only after reviewing the full authorization model.
