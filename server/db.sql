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
    time timestamptz NOT NULL,

    CONSTRAINT text_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mem (
    mem_id serial PRIMARY KEY,
    text_id int NOT NULL,
    account_id int NOT NULL,
    create_time timestamptz NOT NULL,
    last_change_time timestamptz NOT NULL,

    CONSTRAINT mem_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id) ON DELETE CASCADE,
    CONSTRAINT mem_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mem_text (
    mem_id int NOT NULL,
    text_id int NOT NULL,

    PRIMARY KEY (mem_id, text_id),
    CONSTRAINT mem_text_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id) ON DELETE CASCADE,
    CONSTRAINT mem_text_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id) ON DELETE CASCADE
);
