-- TrainU Trainer Directory Seed Data
-- Run this in Supabase SQL Editor to populate the trainers table

-- Create trainers table if it doesn't exist
create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  title text,
  bio text,
  avatar_url text,
  image text,
  city text,
  state text,
  location text,
  specialties text[] default '{}',
  rating numeric(3,2),
  clients integer default 0,
  sessions integer default 0,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.trainers enable row level security;

-- Create policy for public read access
create policy "Trainers are viewable by everyone" on public.trainers
  for select using (true);

-- Insert sample trainer data
insert into public.trainers (slug, name, title, bio, avatar_url, image, city, state, location, specialties, rating, clients, sessions, verified)
values
  (
    'jane-doe',
    'Jane Doe',
    'Certified Personal Trainer',
    'Jane is a NASM-certified personal trainer with over 5 years of experience helping clients achieve their fitness goals. She specializes in strength training, weight loss, and functional movement patterns.',
    'https://images.unsplash.com/photo-1594824388852-8913c6c3c2d7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1594824388852-8913c6c3c2d7?w=400&h=400&fit=crop&crop=face',
    'Chicago',
    'IL',
    'Chicago, IL',
    array['Strength Training', 'Weight Loss', 'Functional Movement'],
    4.9,
    45,
    1200,
    true
  ),
  (
    'john-smith',
    'John Smith',
    'Strength & Conditioning Coach',
    'John is a CSCS-certified strength and conditioning coach who works with athletes and general population clients. He has a background in powerlifting and Olympic weightlifting.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
    'Evanston',
    'IL',
    'Evanston, IL',
    array['Powerlifting', 'Olympic Weightlifting', 'Athletic Performance'],
    4.8,
    38,
    950,
    true
  ),
  (
    'sarah-johnson',
    'Sarah Johnson',
    'Yoga & Mobility Instructor',
    'Sarah is a 500-hour RYT certified yoga instructor specializing in vinyasa flow, restorative yoga, and mobility work. She helps clients improve flexibility, reduce stress, and build mind-body connection.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'Oak Park',
    'IL',
    'Oak Park, IL',
    array['Yoga', 'Mobility', 'Stress Reduction'],
    4.7,
    52,
    800,
    true
  ),
  (
    'mike-chen',
    'Mike Chen',
    'HIIT & Cardio Specialist',
    'Mike is an ACE-certified personal trainer who specializes in high-intensity interval training (HIIT) and cardiovascular conditioning. He creates challenging yet fun workouts that deliver results.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Naperville',
    'IL',
    'Naperville, IL',
    array['HIIT', 'Cardio', 'Fat Loss'],
    4.6,
    41,
    1100,
    false
  ),
  (
    'emily-rodriguez',
    'Emily Rodriguez',
    'Nutrition & Wellness Coach',
    'Emily is a certified nutrition coach and personal trainer who takes a holistic approach to health and fitness. She combines movement, nutrition, and lifestyle coaching to help clients achieve sustainable results.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    'Schaumburg',
    'IL',
    'Schaumburg, IL',
    array['Nutrition', 'Wellness', 'Lifestyle Coaching'],
    4.8,
    35,
    750,
    true
  ),
  (
    'david-wilson',
    'David Wilson',
    'Senior Fitness Specialist',
    'David specializes in training clients over 50, focusing on maintaining strength, mobility, and independence as we age. He has extensive experience with joint health and injury prevention.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'Arlington Heights',
    'IL',
    'Arlington Heights, IL',
    array['Senior Fitness', 'Joint Health', 'Injury Prevention'],
    4.9,
    28,
    600,
    true
  )
on conflict (slug) do nothing;

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_trainers_updated_at
  before update on public.trainers
  for each row execute procedure public.handle_updated_at();

-- Verify the data
select count(*) as trainer_count from public.trainers;
