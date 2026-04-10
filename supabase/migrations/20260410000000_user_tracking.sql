-- User tracking: events + admin_users
-- Schema: eduven

-- 1. User events table
CREATE TABLE eduven.user_events (
  id          bigserial       PRIMARY KEY,
  event_type  text            NOT NULL,
  user_ip     text,
  user_agent  text,
  device_type text,
  device_os   text,
  device_browser text,
  screen_width  int,
  screen_height int,
  language    text,
  timezone    text,
  connection_type text,
  is_touch    boolean,
  dark_mode   boolean,
  referrer    text,
  metadata    jsonb           NOT NULL DEFAULT '{}',
  session_id  text,
  created_at  timestamptz     NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_events_event_type  ON eduven.user_events (event_type);
CREATE INDEX idx_user_events_created_at  ON eduven.user_events (created_at DESC);
CREATE INDEX idx_user_events_user_ip     ON eduven.user_events (user_ip);
CREATE INDEX idx_user_events_session_id  ON eduven.user_events (session_id);

-- 2. Admin users table (MVP hardcoded)
CREATE TABLE eduven.admin_users (
  id            serial        PRIMARY KEY,
  email         text          UNIQUE,
  password_hash text,
  created_at    timestamptz   DEFAULT now()
);

INSERT INTO eduven.admin_users (email, password_hash)
VALUES ('arbache@gmail.com', 'Sarbache*6570');

-- 3. Grants
GRANT ALL ON eduven.user_events  TO service_role;
GRANT ALL ON eduven.admin_users  TO service_role;
GRANT USAGE, SELECT ON SEQUENCE eduven.user_events_id_seq  TO service_role;
GRANT USAGE, SELECT ON SEQUENCE eduven.admin_users_id_seq  TO service_role;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
