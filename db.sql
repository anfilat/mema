CREATE TABLE IF NOT EXISTS account (
    account_id serial PRIMARY KEY,
    email VARCHAR(64) NOT NULL,
    password VARCHAR(64),

    CONSTRAINT account_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS text (
    text_id serial PRIMARY KEY,
    account_id int NOT NULL,
    text TEXT,
    time timestamp NOT NULL,

    CONSTRAINT text_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE TABLE IF NOT EXISTS mem (
    mem_id serial PRIMARY KEY,
    text_id int NOT NULL,
    account_id int NOT NULL,
    title text,
    create_time timestamp NOT NULL,
    last_change_time timestamp NOT NULL,

    CONSTRAINT mem_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id),
    CONSTRAINT mem_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id)
);

CREATE TABLE IF NOT EXISTS mem_text (
    mem_id int NOT NULL,
    text_id int NOT NULL,

    PRIMARY KEY (mem_id, text_id)
);
