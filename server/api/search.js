const _ = require('lodash');
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
    const list = await db.listItems(req.userData.userId, parseTerms(text), limit, offset);

    res
        .json({
            list,
        });
}

const parseTermsRe = /\s*("[^"]+"|\S+)\s*/g;

function parseTerms(text) {
    return _.map(text.trim().match(parseTermsRe), term => {
        term = term.trim();
        if (term[0] === '"') {
            return term.substring(1, term.length - 1);
        }
        return term;
    });
}
