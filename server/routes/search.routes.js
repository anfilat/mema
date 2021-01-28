const {Router} = require('express');
const search = require('../api/search');
const {stopOnError} = require('./util');

const router = Router();

// /api/search/list
router.post(
    '/list',
    [
        ...search.checkList,
        stopOnError('Incorrect data'),
    ],
    search.list
);

// /api/search/extract
router.post(
    '/extract',
    [
        ...search.checkExtract,
        stopOnError('Incorrect data'),
    ],
    search.extract
);

// /api/search/up
router.post(
    '/up',
    [
        ...search.checkUp,
        stopOnError('Incorrect data'),
    ],
    search.up
);

// /api/search/down
router.post(
    '/down',
    [
        ...search.checkDown,
        stopOnError('Incorrect data'),
    ],
    search.down
);

module.exports = router;
