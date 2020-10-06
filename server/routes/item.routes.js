const {Router} = require('express');
const auth = require('../middleware/auth.middleware')
const item = require('./item');
const {stopOnError} = require('./util');

const router = Router();

// /api/item/add
router.post(
    '/add',
    auth,
    [
        ...item.checkAdd,
        stopOnError('Empty text'),
    ],
    item.add
);

module.exports = router;
