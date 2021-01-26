const CronJob = require('cron').CronJob;
const db = require('./db');

new CronJob('00 05 00 * * *', async () => {
    console.log('Deleting old tokens...');
    const count = await db.deleteOldTokens();
    console.log(`Deleted ${count} tokens`);
}, null, true);
