
-- Create matches table to properly track mutual interests
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Add Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policy to view matches where user is involved
CREATE POLICY "Users can view their matches" 
  ON public.matches 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Policy to insert matches (handled by function)
CREATE POLICY "System can create matches" 
  ON public.matches 
  FOR INSERT 
  WITH CHECK (true);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy to view messages in matches where user is involved
CREATE POLICY "Users can view messages in their matches" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Policy to send messages in matches where user is involved
CREATE POLICY "Users can send messages in their matches" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Function to handle interest and create matches
CREATE OR REPLACE FUNCTION public.handle_interest(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  existing_interest UUID;
  match_record RECORD;
  result JSON;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  IF current_user_id = target_user_id THEN
    RETURN json_build_object('error', 'Cannot show interest in yourself');
  END IF;
  
  -- Check if current user already showed interest
  SELECT id INTO existing_interest 
  FROM public.interests 
  WHERE from_user_id = current_user_id AND to_user_id = target_user_id;
  
  -- If not, create the interest
  IF existing_interest IS NULL THEN
    INSERT INTO public.interests (from_user_id, to_user_id)
    VALUES (current_user_id, target_user_id);
  END IF;
  
  -- Check if there's mutual interest (other user showed interest back)
  IF EXISTS (
    SELECT 1 FROM public.interests 
    WHERE from_user_id = target_user_id AND to_user_id = current_user_id
  ) THEN
    -- Create match (ensure user1_id < user2_id for consistency)
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(current_user_id, target_user_id),
      GREATEST(current_user_id, target_user_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
    
    -- Get match details
    SELECT m.*, p1.name as user1_name, p2.name as user2_name
    INTO match_record
    FROM public.matches m
    JOIN public.profiles p1 ON p1.id = m.user1_id
    JOIN public.profiles p2 ON p2.id = m.user2_id
    WHERE (m.user1_id = current_user_id AND m.user2_id = target_user_id)
       OR (m.user1_id = target_user_id AND m.user2_id = current_user_id);
    
    result := json_build_object(
      'type', 'match',
      'match_id', match_record.id,
      'message', 'It''s a match!'
    );
  ELSE
    result := json_build_object(
      'type', 'interest_sent',
      'message', 'Interest sent! You''ll be notified if they''re interested too.'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Enable realtime for matches and messages
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.matches;
ALTER publication supabase_realtime ADD TABLE public.messages;
