const {Router} = require('express');
const item = require('../api/item');
const {stopOnError} = require('./util');

const router = Router();

// /api/item/add
router.post(
    '/add',
    [
        ...item.checkAdd,
        stopOnError('Empty text'),
    ],
    item.add
);

// /api/item/get
router.post(
    '/get',
    [
        ...item.checkGet,
        stopOnError('Incorrect data'),
    ],
    item.get
);

// /api/item/resave
router.post(
    '/resave',
    [
        ...item.checkReSave,
        stopOnError('Incorrect data'),
    ],
    item.reSave
);

// /api/item/update
router.post(
    '/update',
    [
        ...item.checkUpdate,
        stopOnError('Incorrect data'),
    ],
    item.update
);

// /api/item/del
router.post(
    '/del',
    [
        ...item.checkDell,
        stopOnError('Incorrect data'),
    ],
    item.del
);

module.exports = router;
