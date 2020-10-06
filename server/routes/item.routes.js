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

router.use((err, req, res, next) => {
    console.error(err);
    res
        .status(500)
        .json({message: 'Something went wrong, try again'});
});

module.exports = router;
