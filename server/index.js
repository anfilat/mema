const app = require('./app');
const db = require('./db');

const PORT = process.env.APP_PORT ?? 5000;

const server = app.listen(PORT, () => {
    console.log(`App has been started on port ${PORT}...`);
});

server.on('error', error => {
    console.error('Server Error:', error);
    process.exit(1);
});

process.once('SIGTERM', shutDown);
process.once('SIGINT', shutDown);
process.once('SIGUSR2', shutDown);

function shutDown(signal) {
    console.log(`${signal} signal received.`);
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        console.log('Http server closed.');
        db.closeDb(() => {
            console.log('DB connect closed.');
            process.exit(0);
        });
    });
}
