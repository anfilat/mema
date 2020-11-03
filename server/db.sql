CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS account (
    account_id serial PRIMARY KEY,
    email VARCHAR(128) NOT NULL,
    password VARCHAR(128),

    CONSTRAINT account_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS token (
    token CHAR(36) PRIMARY KEY,
    account_id int NOT NULL,

    CONSTRAINT token_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS text (
    text_id serial PRIMARY KEY,
    account_id int NOT NULL,
    text TEXT,
    plain_text TEXT,
    time timestamptz NOT NULL,

    CONSTRAINT text_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS text_account_id_idx ON text(account_id);
CREATE INDEX IF NOT EXISTS text_trgm_tag ON text USING gin (plain_text gin_trgm_ops);

CREATE TABLE IF NOT EXISTS mem (
    mem_id serial PRIMARY KEY,
    account_id int NOT NULL,
    text_id int NOT NULL,
    create_time timestamptz NOT NULL,
    last_change_time timestamptz NOT NULL,

    CONSTRAINT mem_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT mem_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS mem_account_id_idx ON mem(account_id);

CREATE TABLE IF NOT EXISTS mem_text (
    mem_id int NOT NULL,
    text_id int NOT NULL,

    PRIMARY KEY (mem_id, text_id),
    CONSTRAINT mem_text_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id) ON DELETE CASCADE,
    CONSTRAINT mem_text_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tag (
    tag_id serial PRIMARY KEY,
    account_id int NOT NULL,
    tag VARCHAR(200) NOT NULL,
    time timestamptz NOT NULL,

    CONSTRAINT tag_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT tag_account_id_tag UNIQUE (account_id, tag)
);

CREATE INDEX IF NOT EXISTS tag_trgm_tag ON tag USING gin (tag gin_trgm_ops);

CREATE TABLE IF NOT EXISTS mem_tag (
    mem_id int NOT NULL,
    tag_id int NOT NULL,

    PRIMARY KEY (mem_id, tag_id),
    CONSTRAINT mem_tag_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id) ON DELETE CASCADE,
    CONSTRAINT mem_tag_tag_id_fk FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE
);
