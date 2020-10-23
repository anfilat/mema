const {body} = require('express-validator');
const db = require('../db');

exports.checkList = [
    body('text')
        .isString()
        .withMessage('Incorrect data'),
];

exports.list = async (req, res) => {
    const {text} = req.body;
    const list = await db.listTags(req.userData.userId, text.trim());

    res
        .json({
            list,
        });
}
