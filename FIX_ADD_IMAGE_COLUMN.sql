-- Quick Fix: Add missing 'image' column to trainers table
-- Run this FIRST, then run the main seed SQL

ALTER TABLE public.trainers 
ADD COLUMN IF NOT EXISTS image text;

