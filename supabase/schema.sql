-- Modular Virtual World - Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_color TEXT DEFAULT '#3b82f6',
  avatar_shape TEXT DEFAULT 'circle',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20)
);

-- Rooms table (world coordinates)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coord_x INTEGER NOT NULL,
  coord_y INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coord_x, coord_y)
);

-- Modules table (objects in rooms)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  shape TEXT NOT NULL DEFAULT 'square',
  size FLOAT NOT NULL DEFAULT 40,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  behavior TEXT DEFAULT 'none',
  behavior_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_shape CHECK (shape IN ('square', 'circle', 'triangle')),
  CONSTRAINT valid_behavior CHECK (behavior IN ('none', 'teleport', 'button', 'platform', 'message'))
);

-- Inventory items
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_data JSONB,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type)
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_type)
);

-- Friends system
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'blocked')),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

-- Chat messages (persistent history)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT message_length CHECK (char_length(message) <= 500)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_coords ON public.rooms(coord_x, coord_y);
CREATE INDEX IF NOT EXISTS idx_modules_room ON public.modules(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_chat_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, users can update their own
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Rooms: Public rooms visible to all, users can create
CREATE POLICY "Public rooms are viewable" ON public.rooms FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Room owners can update" ON public.rooms FOR UPDATE USING (auth.uid() = owner_id);

-- Modules: Visible in public rooms, creators can modify
CREATE POLICY "Modules in public rooms viewable" ON public.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = modules.room_id AND rooms.is_public = true)
);
CREATE POLICY "Users can create modules" ON public.modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Module creators can update" ON public.modules FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Module creators can delete" ON public.modules FOR DELETE USING (auth.uid() = creator_id);

-- Inventory: Users can only see/modify own
CREATE POLICY "Users can view own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own inventory" ON public.inventory FOR ALL USING (auth.uid() = user_id);

-- Achievements: Users can only see/modify own
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- Friendships: Users can see their own friendships
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);
CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE USING (auth.uid() = user_id);

-- Chat: Everyone can read recent messages in public rooms, authenticated users can post
CREATE POLICY "Chat visible in public rooms" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = chat_messages.room_id AND rooms.is_public = true)
);
CREATE POLICY "Authenticated users can chat" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions

-- Function to get or create room
CREATE OR REPLACE FUNCTION get_or_create_room(p_coord_x INTEGER, p_coord_y INTEGER)
RETURNS UUID AS $$
DECLARE
  room_uuid UUID;
BEGIN
  SELECT id INTO room_uuid FROM public.rooms WHERE coord_x = p_coord_x AND coord_y = p_coord_y;
  
  IF room_uuid IS NULL THEN
    INSERT INTO public.rooms (coord_x, coord_y, name)
    VALUES (p_coord_x, p_coord_y, 'Sala (' || p_coord_x || ', ' || p_coord_y || ')')
    RETURNING id INTO room_uuid;
  END IF;
  
  RETURN room_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last seen
CREATE OR REPLACE FUNCTION update_last_seen(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users SET last_seen = NOW() WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- INSERT INTO public.users (id, username, avatar_color, avatar_shape) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Guest', '#3b82f6', 'circle');
