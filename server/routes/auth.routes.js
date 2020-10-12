const {Router} = require('express');
const authCheck = require('../middleware/auth.middleware')
const auth = require('./auth');
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
    authCheck,
    auth.logout
);

// /api/auth/refresh
router.post(
    '/refresh',
    [
        ...auth.checkRefresh,
        stopOnError('Incorrect data'),
    ],
    auth.refresh
);

module.exports = router;
