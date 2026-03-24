DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM user_accounts
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate emails differing only by case detected. Resolve before migration.';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM user_accounts
    GROUP BY LOWER(username)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate usernames differing only by case detected. Resolve before migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_accounts_email_lower
  ON user_accounts (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_accounts_username_lower
  ON user_accounts (LOWER(username));
