-- Row Level Security policies for check_ins table
-- Phase 2: Progress Tracking

-- Users can read their own check-ins
CREATE POLICY "Users can read own check-ins"
  ON public.check_ins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own check-ins
CREATE POLICY "Users can insert own check-ins"
  ON public.check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own check-ins
CREATE POLICY "Users can delete own check-ins"
  ON public.check_ins
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own check-ins (note only typically)
CREATE POLICY "Users can update own check-ins"
  ON public.check_ins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
