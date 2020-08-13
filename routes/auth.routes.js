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

router.use((err, req, res, next) => {
    console.error(err);
    res
        .status(500)
        .json({message: 'Something went wrong, try again'});
});

module.exports = router;
