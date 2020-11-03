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

module.exports = router;
