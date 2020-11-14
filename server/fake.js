const words = require('./node_modules/wordlist-russian/russian-words.json');
const {Pool} = require('pg');
const _ = require('lodash');
require('dotenv').config();
const db = require('./db');

const pool = new Pool({
    connectionString: process.env.APP_PG_CONNECT,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(1);
});

async function addTags() {
    const result = [];

    const sql = 'INSERT INTO tag (account_id, tag, time) VALUES (1, $1, now());';
    for (let i = 1; i < 500; i++) {
        const tag = getWord();
        result.push(tag);
        try {
            await pool.query(sql, [tag]);
        } catch {}
    }
    for (let i = 1; i < 200; i++) {
        const tag = getWord() + ' ' + getWord();
        result.push(tag);
        try {
            await pool.query(sql, [tag]);
        } catch {}
    }
    for (let i = 1; i < 100; i++) {
        const tag = getWord() + ' ' + getWord() + ' ' + getWord();
        result.push(tag);
        try {
            await pool.query(sql, [tag]);
        } catch {}
    }

    return result;
}

async function addMems(tags) {
    for (let i = 1; i < 1000; i++) {
        const text = makeText(5 + randomInt(30));
        const textTags = selectTags(tags, randomInt(5));
        await db.addItem(1, text, textTags);
    }
}

function makeText(len) {
    const result = [];
    for (let i = 1; i < len; i++) {
        let word = getWord();
        const rand = Math.random();
        if (rand < 0.2) {
            word = `*${word}*`;
        } else if (rand < 0.4) {
            word = `__${word}__`;
        }
        result.push(word);
    }

    return result.join(' ');
}

function selectTags(tags, len) {
    const result = [];
    for (let i = 0; i < len; i++) {
        result.push(randomFrom(tags));
    }

    return _.uniq(result);
}

function getWord() {
    return randomFrom(words);
}

function randomFrom(items) {
    return items[randomInt(items.length)];
}

function randomInt(upTo) {
    return Math.floor(Math.random() * upTo);
}

(async function run() {
    db.initDb();
    const tags = await addTags();
    await addMems(tags);
    pool.end();
    db.closeDb();
})();
