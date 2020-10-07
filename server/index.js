const app = require('./app');

const PORT = process.env.APP_PORT ?? 5000;

const server = app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
server.on('error', error => {
    console.error('Server Error:', error);
    process.exit(1);
});
