const {body} = require('express-validator');
const db = require('../db');
const {parseTerms} = require('../helpers/utils')

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
    const {text, limit = 20, offset = 0} = req.body;
    const list = await db.listItems(req.userData.userId, parseTerms(text), limit, offset);

    res
        .json({
            list,
        });
}
