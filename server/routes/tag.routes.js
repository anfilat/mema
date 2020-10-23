const {Router} = require('express');
const tag = require('../api/tag');
const {stopOnError} = require('./util');

const router = Router();

// /api/tag/list
router.post(
    '/list',
    [
        ...tag.checkList,
        stopOnError('Incorrect data'),
    ],
    tag.list
);

module.exports = router;
