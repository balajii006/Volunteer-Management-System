ALTER TABLE user_accounts ADD COLUMN role VARCHAR(30);

ALTER TABLE user_accounts ADD COLUMN phone_number VARCHAR(30);

UPDATE user_accounts SET role = 'volunteer' WHERE role IS NULL OR role = '';

UPDATE user_accounts SET role = LOWER(role) WHERE role IS NOT NULL;

ALTER TABLE user_accounts MODIFY COLUMN role VARCHAR(30) NOT NULL;
