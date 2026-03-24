CREATE TABLE user_accounts (
  id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id, role)
);
