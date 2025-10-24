/*
  # EcoCiudad Database Schema

  ## Overview
  Complete database schema for EcoCiudad platform - citizen environmental participation system

  ## 1. New Tables

  ### `profiles`
  User profile information extending auth.users
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'citizen', 'municipal_admin', 'super_admin'
  - `points` (integer) - Gamification points earned
  - `avatar_url` (text, optional) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp

  ### `reports`
  Environmental incident reports from citizens
  - `id` (uuid, PK) - Report identifier
  - `user_id` (uuid, FK to profiles) - Reporter user ID
  - `title` (text) - Report title/summary
  - `description` (text) - Detailed description
  - `category` (text) - Type: 'basura', 'contaminacion', 'tala_ilegal', 'mal_uso_espacios'
  - `status` (text) - Current state: 'pendiente', 'en_proceso', 'resuelto', 'rechazado'
  - `latitude` (numeric) - Geographic latitude
  - `longitude` (numeric) - Geographic longitude
  - `address` (text, optional) - Human-readable address
  - `image_url` (text, optional) - Evidence photo URL
  - `priority` (text) - Priority level: 'baja', 'media', 'alta'
  - `assigned_to` (uuid, FK to profiles, optional) - Municipal admin assigned
  - `resolved_at` (timestamptz, optional) - Resolution timestamp
  - `created_at` (timestamptz) - Report creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `report_updates`
  Status updates and comments on reports
  - `id` (uuid, PK) - Update identifier
  - `report_id` (uuid, FK to reports) - Associated report
  - `user_id` (uuid, FK to profiles) - User who made update
  - `status` (text, optional) - New status if changed
  - `comment` (text) - Update comment/note
  - `created_at` (timestamptz) - Update timestamp

  ### `rewards`
  Available rewards for gamification
  - `id` (uuid, PK) - Reward identifier
  - `title` (text) - Reward name
  - `description` (text) - Reward details
  - `points_required` (integer) - Points needed to redeem
  - `category` (text) - Type: 'descuento', 'reconocimiento', 'beneficio'
  - `image_url` (text, optional) - Reward image
  - `available_quantity` (integer, optional) - Limited availability
  - `is_active` (boolean) - Whether reward is currently available
  - `created_at` (timestamptz) - Creation timestamp

  ### `user_rewards`
  Redeemed rewards by users
  - `id` (uuid, PK) - Redemption identifier
  - `user_id` (uuid, FK to profiles) - User who redeemed
  - `reward_id` (uuid, FK to rewards) - Redeemed reward
  - `redeemed_at` (timestamptz) - Redemption timestamp
  - `status` (text) - Status: 'pendiente', 'entregado', 'usado'

  ### `activities`
  Gamification activities for earning points
  - `id` (uuid, PK) - Activity identifier
  - `user_id` (uuid, FK to profiles) - User who performed activity
  - `activity_type` (text) - Type: 'reporte_valido', 'reciclaje', 'educacion', 'compartir'
  - `points_earned` (integer) - Points awarded
  - `description` (text) - Activity description
  - `created_at` (timestamptz) - Activity timestamp

  ### `educational_content`
  Environmental education articles and campaigns
  - `id` (uuid, PK) - Content identifier
  - `title` (text) - Content title
  - `content` (text) - Main content/article
  - `category` (text) - Type: 'campana', 'consejo', 'actividad'
  - `image_url` (text, optional) - Featured image
  - `author_id` (uuid, FK to profiles) - Content creator
  - `is_published` (boolean) - Publication status
  - `views` (integer) - View count
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `content_interactions`
  User interactions with educational content
  - `id` (uuid, PK) - Interaction identifier
  - `user_id` (uuid, FK to profiles) - User who interacted
  - `content_id` (uuid, FK to educational_content) - Content item
  - `interaction_type` (text) - Type: 'view', 'like', 'complete'
  - `created_at` (timestamptz) - Interaction timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Profiles: Users can read all profiles, update only their own
  - Reports: Citizens can create and read all, update/delete only their own; Admins can update all
  - Report updates: Authenticated users can read all, create on reports they're involved with
  - Rewards: All users can read active rewards
  - User rewards: Users can read their own redemptions, create new redemptions
  - Activities: Users can read their own activities
  - Educational content: All can read published content; Admins can manage all content
  - Content interactions: Users can manage their own interactions

  ## 3. Indexes
  - Reports: Indexed on status, category, user_id, created_at for efficient queries
  - Activities: Indexed on user_id and created_at for leaderboard queries
  - Educational content: Indexed on category and is_published

  ## 4. Important Notes
  - Geographic coordinates use numeric type for precision
  - All timestamps use timestamptz for timezone awareness
  - Points system is integer-based for simplicity
  - Status fields use text enums for flexibility
  - Foreign keys ensure referential integrity
  - Cascading deletes are set appropriately to maintain data consistency
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'municipal_admin', 'super_admin')),
  points integer NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('basura', 'contaminacion', 'tala_ilegal', 'mal_uso_espacios')),
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'resuelto', 'rechazado')),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text,
  image_url text,
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Create report_updates table
CREATE TABLE IF NOT EXISTS report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pendiente', 'en_proceso', 'resuelto', 'rechazado')),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read report updates"
  ON report_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create updates on their reports"
  ON report_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM reports
        WHERE reports.id = report_id
        AND reports.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('municipal_admin', 'super_admin')
      )
    )
  );

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL,
  category text NOT NULL CHECK (category IN ('descuento', 'reconocimiento', 'beneficio')),
  image_url text,
  available_quantity integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('municipal_admin', 'super_admin')
  ));

CREATE POLICY "Admins can manage rewards"
  ON rewards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  );

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  redeemed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'entregado', 'usado'))
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
  ON user_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all redemptions"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update redemptions"
  ON user_rewards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('reporte_valido', 'reciclaje', 'educacion', 'compartir')),
  points_earned integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for activities leaderboard
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC);

-- Create educational_content table
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('campana', 'consejo', 'actividad')),
  image_url text,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_published boolean DEFAULT false,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published content"
  ON educational_content FOR SELECT
  TO authenticated
  USING (is_published = true OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('municipal_admin', 'super_admin')
  ));

CREATE POLICY "Admins can manage content"
  ON educational_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('municipal_admin', 'super_admin')
    )
  );

-- Create indexes for educational content
CREATE INDEX IF NOT EXISTS idx_content_category ON educational_content(category);
CREATE INDEX IF NOT EXISTS idx_content_published ON educational_content(is_published, created_at DESC);

-- Create content_interactions table
CREATE TABLE IF NOT EXISTS content_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'complete')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id, interaction_type)
);

ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own interactions"
  ON content_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create interactions"
  ON content_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON content_interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);