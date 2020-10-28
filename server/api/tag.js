const {body} = require('express-validator');
const db = require('../db');
const {cleanTags} = require('../helpers/utils')

exports.checkList = [
    body('text')
        .isString()
        .withMessage('Incorrect data'),
    body('tags')
        .custom(value => value == null || Array.isArray(value))
        .withMessage('Tags are not array'),
];

exports.list = async (req, res) => {
    const {text, tags} = req.body;
    const list = await db.listTags(req.userData.userId, text.trim(), cleanTags(tags));

    res
        .json({
            list,
        });
}
