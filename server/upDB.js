const fs = require('fs');
const path = require('path');
const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.APP_PG_CONNECT,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(1);
});

const sql = fs.readFileSync(path.resolve(__dirname, 'db.sql'), 'utf-8');

pool.query(sql, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Database is ok');
    pool.end(() => {
        process.exit(0);
    });
});
