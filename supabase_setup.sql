-- 1. Create Profiles Table (Linked to Auth Users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  logo_url text,
  bio text,
  whatsapp_number text, -- Centralized WhatsApp for all events
  portfolio_urls text[], -- Array of strings
  created_at timestamptz default now(),
  primary key (id)
);

-- 2. Create Events Table
create table public.events (
  id uuid not null default gen_random_uuid(),
  photographer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null, -- Unique URL identifier (e.g. 'wedding-sarah')
  drive_link text,
  photo_limit int default 50,
  whatsapp_number text,
  thumbnail_url text,
  created_at timestamptz default now(),
  primary key (id),
  unique(slug)
);

-- 3. Create Photos Table
create table public.photos (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  url text not null,
  name text, -- Original filename from Google Drive
  source_id text, -- Google Drive File ID (for deduplication)
  width int,
  height int,
  created_at timestamptz default now(),
  primary key (id)
);

-- 4. Create Selections Table (Client Choices)
create table public.selections (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  client_session_id text not null, -- To identify client browser/session
  status text not null check (status in ('selected', 'maybe', 'rejected')),
  created_at timestamptz default now(),
  primary key (id),
  unique(event_id, photo_id, client_session_id) -- Prevent duplicate votes per session
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.selections enable row level security;

-- 6. RLS Policies

-- Profiles: Public read, Owner write
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Events: Public read (for clients), Owner write
create policy "Events are viewable by everyone." on public.events for select using (true);
create policy "Photographers can create events." on public.events for insert with check (auth.uid() = photographer_id);
create policy "Photographers can update own events." on public.events for update using (auth.uid() = photographer_id);

-- Photos: Public read, Owner write
create policy "Photos are viewable by everyone." on public.photos for select using (true);
create policy "Photographers can add photos." on public.photos for insert with check (
  exists ( select 1 from public.events where id = event_id and photographer_id = auth.uid() )
);

-- Selections: Public insert/update (Clients), Owner read
create policy "Anyone can insert selections." on public.selections for insert with check (true);
create policy "Anyone can update selections." on public.selections for update using (true);
create policy "Photographers can view selections." on public.selections for select using (
  exists ( select 1 from public.events where id = event_id and photographer_id = auth.uid() )
);

-- 7. Storage Buckets (Run this in SQL Editor too works often, or use Storage UI)
insert into storage.buckets (id, name, public) values ('brand-assets', 'brand-assets', true);
insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', true);

-- Storage Policies (Simplest: Public Read, Auth Write)
create policy "Public Access Brand Assets" on storage.objects for select using ( bucket_id = 'brand-assets' );
create policy "Auth Upload Brand Assets" on storage.objects for insert with check ( bucket_id = 'brand-assets' and auth.role() = 'authenticated' );

create policy "Public Access Event Photos" on storage.objects for select using ( bucket_id = 'event-photos' );
create policy "Auth Upload Event Photos" on storage.objects for insert with check ( bucket_id = 'event-photos' and auth.role() = 'authenticated' );

-- 8. [IMPORTANT] Auto-create Profile on Signup Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
