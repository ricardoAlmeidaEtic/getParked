-- Fix RLS policies for parkings table

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all parkings" ON parkings;
DROP POLICY IF EXISTS "Owners can insert own parkings" ON parkings;
DROP POLICY IF EXISTS "Owners can update own parkings" ON parkings;
DROP POLICY IF EXISTS "Owners can delete own parkings" ON parkings;

-- Create RLS policies for parkings table

-- Policy 1: Allow all authenticated users to view parkings (for map display)
CREATE POLICY "Users can view all parkings" ON parkings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow authenticated users to insert parkings (they become the owner)
CREATE POLICY "Owners can insert own parkings" ON parkings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy 3: Allow owners to update their own parkings
CREATE POLICY "Owners can update own parkings" ON parkings
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy 4: Allow owners to delete their own parkings
CREATE POLICY "Owners can delete own parkings" ON parkings
  FOR DELETE USING (auth.uid() = owner_id); 