-- TrainU Expanded Trainer Directory Seed Data
-- Run this in Supabase SQL Editor
-- This creates 15 diverse trainers across different specialties

-- Create trainers table (standalone version for directory)
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
drop policy if exists "Trainers are viewable by everyone" on public.trainers;
create policy "Trainers are viewable by everyone" on public.trainers
  for select using (true);

-- Clear existing data
truncate table public.trainers restart identity cascade;

-- Insert 15 diverse trainers
insert into public.trainers (slug, name, title, bio, avatar_url, image, city, state, location, specialties, rating, clients, sessions, verified)
values
  -- 1. Sarah Johnson - Strength & Conditioning
  (
    'sarah-johnson',
    'Sarah Johnson',
    'Strength & Conditioning Specialist',
    'CSCS-certified with 8 years of experience. Former D1 athlete specializing in strength training, Olympic lifts, and athletic performance. I help clients build functional strength and power.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
    'Chicago',
    'IL',
    'Chicago, IL',
    array['Strength Training', 'Olympic Weightlifting', 'Athletic Performance'],
    4.9,
    68,
    1420,
    true
  ),
  -- 2. Marcus Williams - CrossFit & HIIT
  (
    'marcus-williams',
    'Marcus Williams',
    'CrossFit Level 2 Trainer',
    'CrossFit athlete and coach with a passion for high-intensity training. I create challenging workouts that push your limits while maintaining proper form and preventing injury.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'Evanston',
    'IL',
    'Evanston, IL',
    array['CrossFit', 'HIIT', 'Metabolic Conditioning'],
    4.8,
    54,
    1150,
    true
  ),
  -- 3. Emily Chen - Yoga & Mindfulness
  (
    'emily-chen',
    'Emily Chen',
    'Yoga & Mindfulness Coach',
    '500-hour RYT certified in Vinyasa and Yin yoga. I blend traditional yoga practice with modern movement science to improve flexibility, reduce stress, and build mind-body awareness.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=600&fit=crop',
    'Oak Park',
    'IL',
    'Oak Park, IL',
    array['Yoga', 'Mobility', 'Mindfulness', 'Stress Management'],
    4.9,
    72,
    980,
    true
  ),
  -- 4. David Martinez - Sports Performance
  (
    'david-martinez',
    'David Martinez',
    'Sports Performance Coach',
    'Former professional soccer player turned performance coach. I specialize in speed, agility, and sport-specific training for athletes of all levels.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop',
    'Naperville',
    'IL',
    'Naperville, IL',
    array['Sports Performance', 'Speed Training', 'Agility', 'Soccer'],
    4.7,
    42,
    890,
    true
  ),
  -- 5. Jessica Taylor - Weight Loss Specialist
  (
    'jessica-taylor',
    'Jessica Taylor',
    'Weight Loss & Body Transformation',
    'ACE-certified with a specialization in weight management. Lost 80lbs myself and now help others achieve sustainable weight loss through balanced training and nutrition coaching.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop',
    'Schaumburg',
    'IL',
    'Schaumburg, IL',
    array['Weight Loss', 'Body Transformation', 'Nutrition', 'Cardio'],
    4.8,
    91,
    1680,
    true
  ),
  -- 6. Brandon Lee - Powerlifting
  (
    'brandon-lee',
    'Brandon Lee',
    'Powerlifting Coach',
    'Competitive powerlifter with multiple state records. I coach raw and equipped lifting, focusing on squat, bench, and deadlift technique and programming.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop',
    'Arlington Heights',
    'IL',
    'Arlington Heights, IL',
    array['Powerlifting', 'Strength Training', 'Competition Prep'],
    4.9,
    36,
    720,
    true
  ),
  -- 7. Amanda Rodriguez - Pre/Postnatal
  (
    'amanda-rodriguez',
    'Amanda Rodriguez',
    'Pre & Postnatal Fitness Specialist',
    'Certified pre and postnatal exercise specialist. I help expecting and new mothers stay active safely, recover postpartum, and regain strength.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
    'Downers Grove',
    'IL',
    'Downers Grove, IL',
    array['Prenatal Fitness', 'Postnatal Recovery', 'Core Rehab', 'Pelvic Floor'],
    4.9,
    48,
    650,
    true
  ),
  -- 8. Kevin Park - Bodybuilding
  (
    'kevin-park',
    'Kevin Park',
    'Bodybuilding & Physique Coach',
    'IFBB Pro card holder and contest prep coach. I specialize in muscle hypertrophy, contest prep, and achieving your dream physique through progressive training.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop',
    'Wheaton',
    'IL',
    'Wheaton, IL',
    array['Bodybuilding', 'Muscle Building', 'Contest Prep', 'Nutrition'],
    4.7,
    39,
    810,
    true
  ),
  -- 9. Rachel Green - Pilates
  (
    'rachel-green',
    'Rachel Green',
    'Pilates & Core Specialist',
    'Comprehensively certified Pilates instructor (mat and reformer). I focus on core strength, posture correction, and injury rehabilitation through controlled movement.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=600&fit=crop',
    'Elmhurst',
    'IL',
    'Elmhurst, IL',
    array['Pilates', 'Core Strength', 'Posture', 'Injury Prevention'],
    4.8,
    65,
    890,
    true
  ),
  -- 10. Chris Anderson - Senior Fitness
  (
    'chris-anderson',
    'Chris Anderson',
    'Senior Fitness Specialist',
    'Specialized in training clients 55+. Focus on balance, fall prevention, joint health, and maintaining independence. Exercise is medicine!',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=600&fit=crop',
    'Glenview',
    'IL',
    'Glenview, IL',
    array['Senior Fitness', 'Balance Training', 'Fall Prevention', 'Joint Health'],
    4.9,
    58,
    760,
    true
  ),
  -- 11. Mia Patel - Running Coach
  (
    'mia-patel',
    'Mia Patel',
    'Running & Endurance Coach',
    'Marathon runner and RRCA certified coach. I help runners of all levels improve their form, prevent injuries, and achieve their race goals from 5K to ultra.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
    'Park Ridge',
    'IL',
    'Park Ridge, IL',
    array['Running', 'Marathon Training', 'Endurance', 'Injury Prevention'],
    4.8,
    51,
    920,
    true
  ),
  -- 12. Tyler Brooks - Functional Fitness
  (
    'tyler-brooks',
    'Tyler Brooks',
    'Functional Movement Specialist',
    'FMS certified with focus on movement quality over quantity. I help clients move better, reduce pain, and build strength for real-life activities.',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=600&fit=crop',
    'Des Plaines',
    'IL',
    'Des Plaines, IL',
    array['Functional Training', 'Movement Quality', 'Pain Reduction', 'Mobility'],
    4.7,
    44,
    710,
    false
  ),
  -- 13. Nina Kowalski - Kickboxing
  (
    'nina-kowalski',
    'Nina Kowalski',
    'Kickboxing & Martial Arts Instructor',
    'Black belt in kickboxing with 10 years teaching experience. I offer high-energy workouts that build cardio, strength, and self-defense skills.',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop',
    'Mount Prospect',
    'IL',
    'Mount Prospect, IL',
    array['Kickboxing', 'Martial Arts', 'Cardio', 'Self Defense'],
    4.8,
    62,
    1040,
    true
  ),
  -- 14. James Wilson - Athletic Training
  (
    'james-wilson',
    'James Wilson',
    'Athletic Trainer & Rehab Specialist',
    'Licensed athletic trainer specializing in injury recovery and return-to-sport training. I bridge the gap between physical therapy and performance training.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&crop=entropy',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'Buffalo Grove',
    'IL',
    'Buffalo Grove, IL',
    array['Injury Rehab', 'Athletic Training', 'Return to Sport', 'Corrective Exercise'],
    4.9,
    41,
    620,
    true
  ),
  -- 15. Sophia Martinez - Group Fitness
  (
    'sophia-martinez',
    'Sophia Martinez',
    'Group Fitness & Bootcamp Instructor',
    'Energetic group fitness instructor specializing in bootcamp-style workouts. I create fun, challenging group classes that build community and results.',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop',
    'Palatine',
    'IL',
    'Palatine, IL',
    array['Group Fitness', 'Bootcamp', 'HIIT', 'Team Training'],
    4.7,
    89,
    1340,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  title = excluded.title,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  image = excluded.image,
  city = excluded.city,
  state = excluded.state,
  location = excluded.location,
  specialties = excluded.specialties,
  rating = excluded.rating,
  clients = excluded.clients,
  sessions = excluded.sessions,
  verified = excluded.verified,
  updated_at = timezone('utc'::text, now());

-- Create updated_at trigger if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_trainers_updated_at on public.trainers;
create trigger handle_trainers_updated_at
  before update on public.trainers
  for each row execute procedure public.handle_updated_at();

-- Verify the data
select 
  count(*) as total_trainers,
  count(*) filter (where verified = true) as verified_trainers,
  array_agg(distinct city order by city) as cities
from public.trainers;

-- Show sample data
select slug, name, title, city, rating, clients, verified
from public.trainers
order by rating desc, clients desc
limit 5;

