-- MimamoriBridge Initial Schema

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('watcher', 'senior')),
  avatar_url text,
  timezone text DEFAULT 'Asia/Tokyo',
  created_at timestamptz DEFAULT now()
);

-- Families table
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Family members junction table
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('watcher', 'senior')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Check-ins table
CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid REFERENCES users(id),
  family_id uuid REFERENCES families(id),
  type text NOT NULL CHECK (type IN ('morning', 'manual', 'tap_response')),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Health signals table
CREATE TABLE health_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid REFERENCES users(id),
  family_id uuid REFERENCES families(id),
  signal_type text NOT NULL CHECK (signal_type IN ('steps', 'location_change', 'battery', 'app_active')),
  value jsonb NOT NULL,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id),
  senior_id uuid REFERENCES users(id),
  alert_type text NOT NULL CHECK (alert_type IN ('no_checkin', 'low_steps', 'no_activity', 'manual')),
  message text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notification settings table
CREATE TABLE notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE,
  checkin_time time DEFAULT '07:00',
  reminder_delay interval DEFAULT '60 minutes',
  alert_delay interval DEFAULT '120 minutes',
  steps_threshold integer DEFAULT 100,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '06:00',
  expo_push_token text,
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_check_ins_senior ON check_ins(senior_id, created_at DESC);
CREATE INDEX idx_health_signals_senior ON health_signals(senior_id, recorded_at DESC);
CREATE INDEX idx_health_signals_type ON health_signals(senior_id, signal_type, recorded_at DESC);
CREATE INDEX idx_alerts_family ON alerts(family_id, created_at DESC);
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_families_invite ON families(invite_code);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Families: members can read
CREATE POLICY "Family members can read family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create family" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());
-- Allow reading family by invite code for joining
CREATE POLICY "Anyone can lookup by invite code" ON families
  FOR SELECT USING (true);

-- Family members: members can read, users can join
CREATE POLICY "Family members can read members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members fm WHERE fm.user_id = auth.uid())
  );
CREATE POLICY "Users can join family" ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Check-ins: family members can read, seniors can insert
CREATE POLICY "Family members can read check-ins" ON check_ins
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Seniors can create check-ins" ON check_ins
  FOR INSERT WITH CHECK (senior_id = auth.uid());
CREATE POLICY "Watchers can create manual check-ins" ON check_ins
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Health signals: family members can read, seniors can insert
CREATE POLICY "Family members can read signals" ON health_signals
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Seniors can insert signals" ON health_signals
  FOR INSERT WITH CHECK (senior_id = auth.uid());

-- Alerts: family members can read
CREATE POLICY "Family members can read alerts" ON alerts
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Notification settings: own settings only
CREATE POLICY "Users can read own settings" ON notification_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON notification_settings
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON notification_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Auto-delete health signals older than 90 days (run via cron)
-- SELECT cron.schedule('cleanup-old-signals', '0 3 * * *',
--   $$DELETE FROM health_signals WHERE recorded_at < now() - interval '90 days'$$
-- );
