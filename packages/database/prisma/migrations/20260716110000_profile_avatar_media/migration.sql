CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
LANGUAGE SQL STABLE PARALLEL SAFE
RETURN NULLIF(current_setting('app.current_user_id',true),'')::uuid;
REVOKE ALL ON FUNCTION app.current_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.current_user_id() TO nexo_migration,nexo_runtime,nexo_readonly;

CREATE TABLE profile_avatar_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_key varchar(500) NOT NULL UNIQUE,
  content_type varchar(80) NOT NULL,
  size_bytes integer NOT NULL,
  checksum char(64) NOT NULL,
  etag varchar(128),
  status varchar(24) NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  removed_at timestamptz(6),
  CONSTRAINT profile_avatar_size CHECK(size_bytes>0 AND size_bytes<=5242880),
  CONSTRAINT profile_avatar_status CHECK(status IN ('ACTIVE','SUPERSEDED','REMOVED')),
  CONSTRAINT profile_avatar_checksum CHECK(checksum ~ '^[a-f0-9]{64}$')
);
CREATE INDEX profile_avatar_media_user_status_idx ON profile_avatar_media(user_id,status);
CREATE UNIQUE INDEX profile_avatar_media_one_active ON profile_avatar_media(user_id) WHERE status='ACTIVE';

ALTER TABLE profile_avatar_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_avatar_media FORCE ROW LEVEL SECURITY;
CREATE POLICY profile_avatar_owner ON profile_avatar_media AS RESTRICTIVE FOR ALL TO nexo_migration,nexo_runtime,nexo_readonly
  USING(user_id=app.current_user_id()) WITH CHECK(user_id=app.current_user_id());
CREATE POLICY profile_avatar_runtime ON profile_avatar_media FOR ALL TO nexo_runtime
  USING(user_id=app.current_user_id()) WITH CHECK(user_id=app.current_user_id());
CREATE POLICY profile_avatar_readonly ON profile_avatar_media FOR SELECT TO nexo_readonly
  USING(user_id=app.current_user_id());
GRANT SELECT,INSERT,UPDATE ON profile_avatar_media TO nexo_runtime;
GRANT SELECT ON profile_avatar_media TO nexo_readonly;
