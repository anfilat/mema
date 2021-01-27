const {body} = require('express-validator');
const db = require('../db');
const {parseTerms} = require('common')

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
    let {text, limit = 20, offset = 0} = req.body;
    const terms = parseTerms(text);
    const termsStr = JSON.stringify(terms);
    const userId = req.userData.userId;
    let ids = null;

    if (offset !== 0) {
        const {search, search_ids} = await db.getLastSearchIds(userId);
        if (search === termsStr) {
            ids = JSON.parse(search_ids);
        }
    }

    if (ids == null) {
        ids = await db.getSearchIds(userId, terms);
        await db.setLastSearchIds(userId, termsStr, ids);
    }


    let list = [];
    let all = offset >= ids.length;
    while (list.length === 0 && !all) {
        list = await db.listItems(userId, ids, limit, offset);
        offset += limit;
        all = offset >= ids.length;
    }

    res
        .json({
            list,
            offset,
            all,
        });
}
