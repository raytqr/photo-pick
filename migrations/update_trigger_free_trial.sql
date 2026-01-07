-- Update the handle_new_user function to grant 2 free events and 1 week trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    subscription_tier, 
    events_remaining, 
    subscription_expires_at
  )
  VALUES (
    new.id, 
    new.email, 
    'free', 
    2, 
    now() + interval '1 week'
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
