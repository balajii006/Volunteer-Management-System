ALTER TABLE user_accounts
  ADD COLUMN IF NOT EXISTS role VARCHAR(30);

ALTER TABLE user_accounts
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user_roles'
  ) THEN
    EXECUTE '
      UPDATE user_accounts ua
      SET role = ur.role
      FROM user_roles ur
      WHERE ua.id = ur.user_id
        AND ua.role IS NULL
    ';
  END IF;
END $$;

-- If a previous enum type exists, normalize column to VARCHAR so new roles work.
DO $$
DECLARE
  role_type text;
BEGIN
  SELECT data_type INTO role_type
  FROM information_schema.columns
  WHERE table_name = 'user_accounts'
    AND column_name = 'role';

  IF role_type = 'USER-DEFINED' THEN
    EXECUTE 'ALTER TABLE user_accounts ALTER COLUMN role TYPE VARCHAR(30) USING role::text';
  END IF;
END $$;

UPDATE user_accounts
SET role = 'volunteer'
WHERE role IS NULL OR role = '';

UPDATE user_accounts
SET role = LOWER(role)
WHERE role IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user_roles'
  ) THEN
    EXECUTE 'DROP TABLE user_roles';
  END IF;
END $$;

ALTER TABLE user_accounts
  ALTER COLUMN role SET NOT NULL;
