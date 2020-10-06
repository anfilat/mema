const {Router} = require('express');
const config = require('config');
const auth = require('./auth');
const {stopOnError} = require('./util');

const router = Router();

// /api/auth/register
if (config.get('register') === 'yes') {
    router.post(
        '/register',
        [
            ...auth.checkRegister,
            stopOnError('Incorrect data'),
        ],
        auth.register
    );
}

// /api/auth/login
router.post(
    '/login',
    [
        ...auth.checkLogin,
        stopOnError('Incorrect data'),
    ],
    auth.login
);

module.exports = router;
