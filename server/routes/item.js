const {body} = require('express-validator');
const db = require('../db');

exports.checkAdd = [
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
];

exports.add = async (req, res) => {
    const {text} = req.body;
    const itemId = await db.addItem(req.account.userId, text);

    res
        .status(201)
        .json({
            message: 'Text saved',
            itemId,
        });
}
