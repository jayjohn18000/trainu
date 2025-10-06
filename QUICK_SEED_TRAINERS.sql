-- TrainU Trainer Directory Seed - Quick Setup
-- INSTRUCTIONS: Copy this entire file and paste into Supabase SQL Editor, then click RUN

-- Step 1: Create the trainers table
CREATE TABLE IF NOT EXISTS public.trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  image text,
  city text,
  state text,
  location text,
  specialties text[] DEFAULT '{}',
  rating numeric(3,2),
  clients integer DEFAULT 0,
  sessions integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable RLS and create public read policy
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers are viewable by everyone" ON public.trainers;
CREATE POLICY "Trainers are viewable by everyone" ON public.trainers
  FOR SELECT USING (true);

-- Step 3: Insert 15 diverse trainers
INSERT INTO public.trainers (slug, name, title, bio, avatar_url, image, city, state, location, specialties, rating, clients, sessions, verified)
VALUES
  -- 1. Sarah Johnson - Strength & Conditioning
  (
    'sarah-johnson',
    'Sarah Johnson',
    'Strength & Conditioning Specialist',
    'CSCS-certified with 8 years of experience. Former D1 athlete specializing in strength training, Olympic lifts, and athletic performance.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
    'Chicago', 'IL', 'Chicago, IL',
    array['Strength Training', 'Olympic Weightlifting', 'Athletic Performance'],
    4.9, 68, 1420, true
  ),
  -- 2. Marcus Williams - CrossFit & HIIT
  (
    'marcus-williams',
    'Marcus Williams',
    'CrossFit Level 2 Trainer',
    'CrossFit athlete and coach with a passion for high-intensity training. I create challenging workouts that push your limits.',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop',
    'Evanston', 'IL', 'Evanston, IL',
    array['CrossFit', 'HIIT', 'Metabolic Conditioning'],
    4.8, 54, 1150, true
  ),
  -- 3. Emily Chen - Yoga & Mindfulness
  (
    'emily-chen',
    'Emily Chen',
    'Yoga & Mindfulness Coach',
    '500-hour RYT certified in Vinyasa and Yin yoga. I blend traditional yoga practice with modern movement science.',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    'Oak Park', 'IL', 'Oak Park, IL',
    array['Yoga', 'Mobility', 'Mindfulness', 'Stress Management'],
    4.9, 72, 980, true
  ),
  -- 4. David Martinez - Sports Performance
  (
    'david-martinez',
    'David Martinez',
    'Sports Performance Coach',
    'Former professional soccer player turned performance coach. I specialize in speed, agility, and sport-specific training.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop',
    'Naperville', 'IL', 'Naperville, IL',
    array['Sports Performance', 'Speed Training', 'Agility', 'Soccer'],
    4.7, 42, 890, true
  ),
  -- 5. Jessica Taylor - Weight Loss
  (
    'jessica-taylor',
    'Jessica Taylor',
    'Weight Loss & Body Transformation',
    'ACE-certified with a specialization in weight management. Lost 80lbs myself and now help others achieve sustainable weight loss.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop',
    'Schaumburg', 'IL', 'Schaumburg, IL',
    array['Weight Loss', 'Body Transformation', 'Nutrition', 'Cardio'],
    4.8, 91, 1680, true
  ),
  -- 6. Brandon Lee - Powerlifting
  (
    'brandon-lee',
    'Brandon Lee',
    'Powerlifting Coach',
    'Competitive powerlifter with multiple state records. I coach raw and equipped lifting.',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop',
    'Arlington Heights', 'IL', 'Arlington Heights, IL',
    array['Powerlifting', 'Strength Training', 'Competition Prep'],
    4.9, 36, 720, true
  ),
  -- 7. Amanda Rodriguez - Pre/Postnatal
  (
    'amanda-rodriguez',
    'Amanda Rodriguez',
    'Pre & Postnatal Fitness Specialist',
    'Certified pre and postnatal exercise specialist. I help expecting and new mothers stay active safely.',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
    'Downers Grove', 'IL', 'Downers Grove, IL',
    array['Prenatal Fitness', 'Postnatal Recovery', 'Core Rehab', 'Pelvic Floor'],
    4.9, 48, 650, true
  ),
  -- 8. Kevin Park - Bodybuilding
  (
    'kevin-park',
    'Kevin Park',
    'Bodybuilding & Physique Coach',
    'IFBB Pro card holder and contest prep coach. I specialize in muscle hypertrophy and contest prep.',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&h=600&fit=crop',
    'Wheaton', 'IL', 'Wheaton, IL',
    array['Bodybuilding', 'Muscle Building', 'Contest Prep', 'Nutrition'],
    4.7, 39, 810, true
  ),
  -- 9. Rachel Green - Pilates
  (
    'rachel-green',
    'Rachel Green',
    'Pilates & Core Specialist',
    'Comprehensively certified Pilates instructor. I focus on core strength, posture correction, and injury rehabilitation.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=600&fit=crop',
    'Elmhurst', 'IL', 'Elmhurst, IL',
    array['Pilates', 'Core Strength', 'Posture', 'Injury Prevention'],
    4.8, 65, 890, true
  ),
  -- 10. Chris Anderson - Senior Fitness
  (
    'chris-anderson',
    'Chris Anderson',
    'Senior Fitness Specialist',
    'Specialized in training clients 55+. Focus on balance, fall prevention, joint health, and maintaining independence.',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&h=600&fit=crop',
    'Glenview', 'IL', 'Glenview, IL',
    array['Senior Fitness', 'Balance Training', 'Fall Prevention', 'Joint Health'],
    4.9, 58, 760, true
  ),
  -- 11. Mia Patel - Running
  (
    'mia-patel',
    'Mia Patel',
    'Running & Endurance Coach',
    'Marathon runner and RRCA certified coach. I help runners improve their form and prevent injuries.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
    'Park Ridge', 'IL', 'Park Ridge, IL',
    array['Running', 'Marathon Training', 'Endurance', 'Injury Prevention'],
    4.8, 51, 920, true
  ),
  -- 12. Tyler Brooks - Functional Fitness
  (
    'tyler-brooks',
    'Tyler Brooks',
    'Functional Movement Specialist',
    'FMS certified with focus on movement quality. I help clients move better and reduce pain.',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=600&fit=crop',
    'Des Plaines', 'IL', 'Des Plaines, IL',
    array['Functional Training', 'Movement Quality', 'Pain Reduction', 'Mobility'],
    4.7, 44, 710, false
  ),
  -- 13. Nina Kowalski - Kickboxing
  (
    'nina-kowalski',
    'Nina Kowalski',
    'Kickboxing & Martial Arts Instructor',
    'Black belt in kickboxing with 10 years teaching experience. High-energy workouts that build cardio and self-defense skills.',
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&h=600&fit=crop',
    'Mount Prospect', 'IL', 'Mount Prospect, IL',
    array['Kickboxing', 'Martial Arts', 'Cardio', 'Self Defense'],
    4.8, 62, 1040, true
  ),
  -- 14. James Wilson - Athletic Training
  (
    'james-wilson',
    'James Wilson',
    'Athletic Trainer & Rehab Specialist',
    'Licensed athletic trainer specializing in injury recovery and return-to-sport training.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&crop=entropy',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'Buffalo Grove', 'IL', 'Buffalo Grove, IL',
    array['Injury Rehab', 'Athletic Training', 'Return to Sport', 'Corrective Exercise'],
    4.9, 41, 620, true
  ),
  -- 15. Sophia Martinez - Group Fitness
  (
    'sophia-martinez',
    'Sophia Martinez',
    'Group Fitness & Bootcamp Instructor',
    'Energetic group fitness instructor specializing in bootcamp-style workouts. I create fun, challenging group classes.',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop',
    'Palatine', 'IL', 'Palatine, IL',
    array['Group Fitness', 'Bootcamp', 'HIIT', 'Team Training'],
    4.7, 89, 1340, true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  image = EXCLUDED.image,
  updated_at = timezone('utc'::text, now());

-- Step 4: Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_trainers_updated_at ON public.trainers;
CREATE TRIGGER handle_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Step 5: Verify success
SELECT COUNT(*) AS total_trainers FROM public.trainers;

