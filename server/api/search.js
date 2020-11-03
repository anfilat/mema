const {body} = require('express-validator');
const db = require('../db');

exports.checkList = [
    body('text')
        .isString()
        .withMessage('Incorrect text'),
    body('limit')
        .custom(value => value == null || (typeof value === 'number' && value >= 1 && value <= 100))
        .withMessage('Incorrect limit'),
    body('offset')
        .custom(value => value == null || (typeof value === 'number' && value >= 0))
        .withMessage('Incorrect from'),
];

exports.list = async (req, res) => {
    const {text, limit, offset} = req.body;
    const list = await db.listItems(req.userData.userId, text.trim(), limit, offset);

    res
        .json({
            list,
        });
}
