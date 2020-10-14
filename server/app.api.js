const bodyParser = require('body-parser');
const authCheck = require('./middleware/auth.middleware')

module.exports = function setupAPI(app) {
    app.use('/api/', bodyParser.json({extended: true}));

    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/item', authCheck);
    app.use('/api/item', require('./routes/item.routes'));

    app.use('/api/', (req, res, next) => {
        res
            .status(404)
            .send('404 - Not Found\n');
    });

    app.use('/api/', (err, req, res, next) => {
        console.error(err);
        res
            .status(500)
            .json({message: 'Something went wrong, try again'});
    });
}
