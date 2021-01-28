const _ = require('lodash');
const {body} = require('express-validator');
const db = require('../db');
const {parseTerms, stringifyTerms} = require('common')

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
    const termsStr = stringifyTerms(terms);
    const userId = req.userData.userId;
    let ids = null;

    if (offset !== 0) {
        const {search, search_ids} = await db.getLastSearchIds(userId);
        if (search === termsStr) {
            try {
                ids = JSON.parse(search_ids);
            } catch {}
        }
    }

    if (ids == null) {
        ids = await db.searchIds(userId, termsStr, terms);
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

exports.checkExtract = [
    body('text')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Incorrect text'),
    body('id')
        .notEmpty()
        .withMessage('No item id'),
];

exports.extract = async (req, res) => {
    const {text, id} = req.body;
    const terms = parseTerms(text);
    const termsStr = stringifyTerms(terms);
    const userId = req.userData.userId;

    await db.updateList(userId, termsStr, terms, (ids, blockIds) => {
        blockIds.push(id);

        return {
            ok: true,
            ids: ids.filter(value => value !== id),
            blockIds: _(blockIds).uniq().value(),
        };
    });

    res.json({
        message: 'Item extracted',
    });
}

exports.checkUp = [
    body('text')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Incorrect text'),
    body('id')
        .notEmpty()
        .withMessage('No item id'),
    body('beforeId')
        .notEmpty()
        .withMessage('No item before id'),
];

exports.up = async (req, res) => {
    const {text, id, beforeId} = req.body;
    const terms = parseTerms(text);
    const termsStr = stringifyTerms(terms);
    const userId = req.userData.userId;
    let ok = true;

    await db.updateList(userId, termsStr, terms, (ids, blockIds) => {
        if (!ids.includes(id) || !ids.includes(beforeId)) {
            ok = false;
            return {
                ok: false,
            }
        }

        ids = ids.filter(value => value !== id);
        ids.splice(ids.indexOf(beforeId), 0, id);
        return {
            ok: true,
            ids,
            blockIds,
        };
    });

    if (ok) {
        res.json({
            message: 'Item moved',
        });
    } else {
        res
            .status(400)
            .json({
                message: 'Outdated',
                outdated: true,
            });
    }
}

exports.checkDown = [
    body('text')
        .isString()
        .withMessage('Incorrect text'),
    body('id')
        .notEmpty()
        .withMessage('No item id'),
    body('afterId')
        .notEmpty()
        .withMessage('No item after id'),
];

exports.down = async (req, res) => {
    const {text, id, afterId} = req.body;
    const terms = parseTerms(text);
    const termsStr = stringifyTerms(terms);
    const userId = req.userData.userId;
    let ok = true;

    await db.updateList(userId, termsStr, terms, (ids, blockIds) => {
        if (!ids.includes(id) || !ids.includes(afterId)) {
            ok = false;
            return {
                ok: false,
            }
        }

        ids = ids.filter(value => value !== id);
        ids.splice(ids.indexOf(afterId) + 1, 0, id);
        return {
            ok: true,
            ids,
            blockIds,
        };
    });

    if (ok) {
        res.json({
            message: 'Item moved',
        });
    } else {
        res
            .status(400)
            .json({
                message: 'Outdated',
                outdated: true,
            });
    }
}
