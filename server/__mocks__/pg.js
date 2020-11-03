const { newDb } = require('pg-mem');

let pgMem;
let pgMemPool;
let backup;

async function pgMemQuery(query, values) {
    if (query.startsWith('BEGIN')) {
        query = 'BEGIN';
    }

    if (query.startsWith('SAVEPOINT')) {
        return Promise.resolve();
    }

    query = query.replace(/similarity\(.*\).*,/, '');

    const matchANY = query.match(/ANY\s*\((.*)\)/);
    if (matchANY) {
        const value = values[parseInt(matchANY[1].substr(1), 10) - 1]
            .map(val => `"${val}"`)
            .join(',');
        query = query.replace(/ANY\s*\((.*)\)/, `ANY('{${value}}')`)
    }

    const matchALL = query.match(/!= ALL\s*\((.*)\)/);
    if (matchALL) {
        const value = values[parseInt(matchALL[1].substr(1), 10) - 1]
            .map(val => `'${val}'`)
            .join(', ');
        query = query.replace(/!= ALL\s*\((.*)\)/, `NOT IN(${value})`)
    }

    return new Promise((resolve, reject) => {
        pgMemPool.query(query, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

function pgMemConnect() {
    return Promise.resolve({
        query: pgMemQuery,
        release() {},
    });
}

function createPgMem() {
    pgMem = newDb();

    const adapter = pgMem.adapters.createPg();
    pgMemPool = new adapter.Pool({
        connectionString: process.env.APP_PG_CONNECT,
    });
}

async function refreshDb() {
    if (backup) {
        backup.restore();
        return;
    }

    await pgMemPool.query(sqlInit);

    backup = pgMem.backup();
}

let pgMock;
let pgMockQuery;
let pgMockConnect;
let pgMockOn;

function createPgMock() {
    pgMock = jest.createMockFromModule('pg');
    pgMockQuery = jest.fn();
    pgMockConnect = jest.fn(() => ({
        query: pgMockQuery,
        release: jest.fn(),
    }))
    pgMockOn = jest.fn();
}

function switchToPgMem() {
    pool.query = pgMemQuery;
    pool.connect = pgMemConnect;
    pool.on = pgMemPool.on;
}

function switchToPgMock() {
    pool.query = pgMockQuery;
    pool.connect = pgMockConnect;
    pool.on = pgMockOn;
}

let pool = {
    refreshDb,
    switchToPgMem,
    switchToPgMock,
};

module.exports = {
    Pool: function() {
        createPgMem();
        createPgMock();
        switchToPgMem();

        return pool;
    }
};

const sqlInit = `
    CREATE TABLE account (
        account_id serial PRIMARY KEY,
        email VARCHAR(128) NOT NULL,
        password VARCHAR(128),
        
        CONSTRAINT account_email_key UNIQUE (email)
    );

    CREATE TABLE token (
        token CHAR(36) PRIMARY KEY,
        account_id int NOT NULL
    );

    ALTER TABLE token ADD CONSTRAINT token_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE TABLE text (
        text_id serial PRIMARY KEY,
        account_id int NOT NULL,
        text TEXT,
        plain_text TEXT,
        time timestamp NOT NULL
    );

    ALTER TABLE text ADD CONSTRAINT text_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE INDEX text_account_id_idx ON text(account_id);

    CREATE TABLE mem (
        mem_id serial PRIMARY KEY,
        account_id int NOT NULL,
        text_id int NOT NULL,
        create_time timestamp NOT NULL,
        last_change_time timestamp NOT NULL
    );

    ALTER TABLE mem ADD CONSTRAINT mem_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);
    ALTER TABLE mem ADD CONSTRAINT mem_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id);

    CREATE INDEX mem_account_id_idx ON mem(account_id);

    CREATE TABLE mem_text (
        mem_id int NOT NULL,
        text_id int NOT NULL,

        PRIMARY KEY (mem_id, text_id)
    );

    ALTER TABLE mem_text ADD CONSTRAINT mem_text_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id);
    ALTER TABLE mem_text ADD CONSTRAINT mem_text_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id);

    CREATE TABLE tag (
        tag_id serial PRIMARY KEY,
        account_id int NOT NULL,
        tag VARCHAR(200) NOT NULL,
        time timestamp NOT NULL,
        
        CONSTRAINT tag_account_id_tag UNIQUE (account_id, tag)
    );

    ALTER TABLE tag ADD CONSTRAINT tag_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE TABLE mem_tag (
        mem_id int NOT NULL,
        tag_id int NOT NULL,
        
        PRIMARY KEY (mem_id, tag_id)
    );

    ALTER TABLE mem_tag ADD CONSTRAINT mem_tag_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id);
    ALTER TABLE mem_tag ADD CONSTRAINT mem_tag_tag_id_fk FOREIGN KEY (tag_id) REFERENCES tag(tag_id);


    INSERT INTO account (email, password) VALUES ('test@test.com', '$2b$10$Buow0yAuljN7cs8vmrtGFOMHd9/78dx7cYuPYop.aA5WdcDX380Ri');
    INSERT INTO token (token, account_id) VALUES ('someToken', 1);

    INSERT INTO tag (account_id, tag, time) VALUES (1, 'something', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'other', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'it', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'and it', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'it''s', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'todo', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'перекат', now());

    INSERT INTO text (account_id, text, plain_text, time) VALUES (1, 'Some text', 'Some text', now());
    INSERT INTO mem (account_id, text_id, create_time, last_change_time) VALUES (1, 1, now(), now());
    INSERT INTO mem_text (mem_id, text_id) VALUES (1, 1);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (1, 1);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (1, 2);

    INSERT INTO text (account_id, text, plain_text, time) VALUES (1, 'Test words', 'Test words', now());
    INSERT INTO mem (account_id, text_id, create_time, last_change_time) VALUES (1, 2, now(), now());
    INSERT INTO mem_text (mem_id, text_id) VALUES (2, 2);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (2, 6);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (2, 7);
    
    INSERT INTO text (account_id, text, plain_text, time) VALUES (1, 'Another test words', 'Another test words', now());
    INSERT INTO mem (account_id, text_id, create_time, last_change_time) VALUES (1, 3, now(), now());
    INSERT INTO mem_text (mem_id, text_id) VALUES (3, 3);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (3, 6);
    INSERT INTO mem_tag (mem_id, tag_id) VALUES (3, 7);

    INSERT INTO text (account_id, text, plain_text, time) VALUES (1, 'Прекрасный переход', 'Прекрасный переход', now());
    INSERT INTO mem (account_id, text_id, create_time, last_change_time) VALUES (1, 4, now(), now());
    INSERT INTO mem_text (mem_id, text_id) VALUES (4, 4);
`;
