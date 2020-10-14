const {Router} = require('express');
const authCheck = require('../middleware/auth.middleware')
const item = require('./item');
const {stopOnError} = require('./util');

const router = Router();

// /api/item/add
router.post(
    '/add',
    authCheck,
    [
        ...item.checkAdd,
        stopOnError('Empty text'),
    ],
    item.add
);

// /api/item/resave
router.post(
    '/resave',
    authCheck,
    [
        ...item.checkResave,
        stopOnError('Incorrect data'),
    ],
    item.resave
);

// /api/item/del
router.post(
    '/del',
    authCheck,
    [
        ...item.checkDell,
        stopOnError('Incorrect data'),
    ],
    item.del
);

module.exports = router;
