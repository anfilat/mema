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

module.exports = router;
