CREATE TABLE refresh_tokens (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);
