-- Create profiles table first (since we reference it in the trigger function)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up RLS for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Set up RLS (Row Level Security) policies for the todos table
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own todos
CREATE POLICY "Users can view their own todos" 
  ON public.todos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own todos
CREATE POLICY "Users can insert their own todos" 
  ON public.todos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own todos
CREATE POLICY "Users can update their own todos" 
  ON public.todos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own todos
CREATE POLICY "Users can delete their own todos" 
  ON public.todos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos (user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos (created_at);

-- Add function to create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
