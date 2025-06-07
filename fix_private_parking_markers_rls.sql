-- Fix RLS policies for private_parking_markers table

-- First, check if RLS is enabled (it probably is, causing the error)
-- ALTER TABLE private_parking_markers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Parking owners can insert markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Parking owners can update own markers" ON private_parking_markers;
DROP POLICY IF EXISTS "Parking owners can delete own markers" ON private_parking_markers;

-- Create RLS policies for private_parking_markers table

-- Policy 1: Allow all authenticated users to view markers (for map display)
CREATE POLICY "Users can view all markers" ON private_parking_markers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow parking owners to insert markers for their own parkings
CREATE POLICY "Parking owners can insert markers" ON private_parking_markers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM parkings 
      WHERE parkings.id = parking_id 
      AND parkings.owner_id = auth.uid()
    )
  );

-- Policy 3: Allow parking owners to update markers for their own parkings
CREATE POLICY "Parking owners can update own markers" ON private_parking_markers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM parkings 
      WHERE parkings.id = parking_id 
      AND parkings.owner_id = auth.uid()
    )
  );

-- Policy 4: Allow parking owners to delete markers for their own parkings
CREATE POLICY "Parking owners can delete own markers" ON private_parking_markers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM parkings 
      WHERE parkings.id = parking_id 
      AND parkings.owner_id = auth.uid()
    )
  ); 