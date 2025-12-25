-- Row-Level Security Policies for users table

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Row-Level Security Policies for goals table

-- Users can read their own goals
CREATE POLICY "Users can read own goals"
ON public.goals
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Users can insert goals for themselves
CREATE POLICY "Users can insert own goals"
ON public.goals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
ON public.goals
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
ON public.goals
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
