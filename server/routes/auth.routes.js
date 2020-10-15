const {Router} = require('express');
const {checkAuth} = require('../helpers/token');
const auth = require('../api/auth');
const {stopOnError} = require('./util');

const router = Router();

// /api/auth/register
if (process.env.APP_REGISTER === 'yes') {
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

// /api/auth/logout
router.post(
    '/logout',
    checkAuth,
    auth.logout
);

module.exports = router;
