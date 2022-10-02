DROP TABLE IF EXISTS account;
CREATE TABLE account (
  id SERIAL,
  username VARCHAR(255) NOT NULL DEFAULT '',
  password VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(320) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  api_key TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX account_username ON account(username);

ALTER TABLE account ALTER COLUMN created_at SET DEFAULT now();
ALTER SEQUENCE account_id_seq RESTART WITH 1;

COMMENT ON TABLE account IS 'Collection of BluePrnt account records';
COMMENT ON COLUMN account.id IS 'Unique account record ID, used as a primary key';
COMMENT ON COLUMN account.username IS 'Unique username to identify the account';
COMMENT ON COLUMN account.password IS 'Bcrypt hash of the accounts password';
COMMENT ON COLUMN account.created_at IS 'The date/timestamp of when the account was created';
COMMENT ON COLUMN account.api_key IS 'The API key used for uploads, to identify a specific account';


DROP TABLE IF EXISTS storage;
CREATE TABLE storage (
  id SERIAL,
  account_id INT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  endpoint_hash VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT storage_ibfk_1 FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX storage_endpoint_hash ON storage(endpoint_hash);

ALTER SEQUENCE storage_id_seq RESTART WITH 1;

COMMENT ON TABLE storage IS 'Record of image collections owned by an account';
COMMENT ON COLUMN storage.id IS 'The storage record ID';
COMMENT ON COLUMN storage.account_id IS 'The owners account ID';
COMMENT ON COLUMN storage.name IS 'Name of file, displayed on the interface';
COMMENT ON COLUMN storage.endpoint_hash IS 'Unique random hash used as a key to identify the users images, used in web endpoint';

DROP TABLE IF EXISTS bucket_object;
CREATE TABLE bucket_object (
  storage_id INT NOT NULL,
  bucket_key VARCHAR(32) NOT NULL,
  mimetype VARCHAR(32) NOT NULL,
  PRIMARY KEY (storage_id, bucket_key),
  CONSTRAINT bucket_object_ibfk_1 FOREIGN KEY (storage_id) REFERENCES storage(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX bucket_object_bucket_key ON bucket_object(bucket_key);
ALTER SEQUENCE bucket_object_id_seq RESTART WITH 1;

COMMENT ON TABLE bucket_object IS 'Record of bucket keys collected, in relation to endpoint hashes';
COMMENT ON COLUMN bucket_object.id IS 'The unique bucket object record ID, used as a primary key';
COMMENT ON COLUMN bucket_object.storage_id IS 'Storage record ID to reference the storage record containing the name, endpoint and account ID (owner)';
COMMENT ON COLUMN bucket_object.bucket_key IS 'Unique random hash used as a key to identify image from S3 bucket in AWS';


DROP TABLE IF EXISTS current_jwt;
CREATE TABLE current_jwt (
  id SERIAL,
  account_id INT NOT NULL,
  jwt_token TEXT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT current_jwt_ibfk_1 FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE
);


ALTER SEQUENCE current_jwt_id_seq RESTART WITH 1;
COMMENT ON TABLE current_jwt IS 'Record of JWT tokens owned by an account';
COMMENT ON COLUMN current_jwt.id IS 'The JWT token record ID';
COMMENT ON COLUMN current_jwt.account_id IS 'Account ID of the JWT holder';
COMMENT ON COLUMN current_jwt.jwt_token IS 'The value of the token, used in query';

DROP TABLE IF EXISTS blacklisted_jwt;
CREATE TABLE blacklisted_jwt (
  id SERIAL,
  jwt_token TEXT NOT NULL,
  PRIMARY KEY (id, jwt_token)
);

ALTER SEQUENCE blacklisted_jwt_id_seq RESTART WITH 1;
COMMENT ON TABLE blacklisted_jwt IS 'Record of blacklisted JWTs collected';
COMMENT ON COLUMN blacklisted_jwt.id IS 'The unique blacklisted JWT record ID, used as a primary key';
COMMENT ON COLUMN blacklisted_jwt.jwt_token IS 'The value of the JWT, used in query';


DROP TABLE IF EXISTS login_history;
CREATE TABLE login_history (
  id SERIAL,
  account_id INT NOT NULL,
  ip_address TEXT NOT NULL,
  login_date TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT login_history_ibfk_1 FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE
);


ALTER SEQUENCE login_history_id_seq RESTART WITH 1;
ALTER TABLE login_history ALTER COLUMN created_at SET DEFAULT now();

COMMENT ON TABLE login_history IS 'Records of login history from an account';
COMMENT ON COLUMN login_history.id IS 'The JWT token record ID';
COMMENT ON COLUMN login_history.account_id IS 'Account ID of the login history record';
COMMENT ON COLUMN login_history.ip_address IS 'IP address of the user who logged in';
COMMENT ON COLUMN login_history.login_date IS 'Login date of user who logged in';


DROP TABLE IF EXISTS verify_login;
CREATE TABLE verify_login (
  id SERIAL,
  account_id INT NOT NULL,
  ip_address TEXT NOT NULL,
  verification_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT verify_login_ibfk_1 FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER SEQUENCE verify_login_id_seq RESTART WITH 1;
ALTER TABLE verify_login ALTER COLUMN created_at SET DEFAULT now();

COMMENT ON TABLE verify_login IS 'Records of login verification codes';
COMMENT ON COLUMN verify_login.id IS 'The login verification record ID';
COMMENT ON COLUMN verify_login.account_id IS 'The account ID of the login verification record, used to identify which account its for';
COMMENT ON COLUMN verify_login.ip_address IS 'The IP address to be validated as a valid login';
COMMENT ON COLUMN verify_login.verification_hash IS 'The value of the login verification code';
COMMENT ON COLUMN verify_login.created_at IS 'The date the login verification code was requested, used to check expiry';