const {body} = require('express-validator');
const db = require('../db');
const {cleanTags} = require('../helpers/utils')

exports.checkAdd = [
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
    body('tags')
        .custom(value => value == null || Array.isArray(value))
        .withMessage('Tags are not array'),
];

exports.add = async (req, res) => {
    const {text, tags} = req.body;
    const userId = req.userData.userId;
    const {memId: itemId, textId} = await db.addItem(userId, text, cleanTags(tags));

    res
        .status(201)
        .json({
            message: 'Text saved',
            itemId,
            textId,
        });
}

exports.checkGet = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
];

exports.get = async (req, res) => {
    const {itemId} = req.body;
    const userId = req.userData.userId;
    const {ok, textId, text, tags} = await db.getItem(userId, itemId);

    if (ok) {
        res.json({
            textId,
            text,
            tags,
        });
    } else {
        res
            .status(400)
            .json({
                message: 'Item not found',
            });
    }
}

exports.checkReSave = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
    body('tags')
        .custom(value => value == null || Array.isArray(value))
        .withMessage('Tags are not array'),
];

exports.reSave = async (req, res) => {
    const {itemId, text, tags} = req.body;
    const userId = req.userData.userId;
    const textId = await db.reSaveItem(userId, itemId, text, cleanTags(tags));

    res.json({
        message: 'Text saved',
        itemId,
        textId,
    });
}

exports.checkUpdate = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
    body('textId')
        .notEmpty()
        .withMessage('No text id'),
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
    body('tags')
        .custom(value => value == null || Array.isArray(value))
        .withMessage('Tags are not array'),
];

exports.update = async (req, res) => {
    const {itemId, textId, text, tags} = req.body;
    const userId = req.userData.userId;
    const ok = await db.updateItem(userId, itemId, textId, text, cleanTags(tags));

    if (ok) {
        res.json({
            message: 'Text saved',
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

exports.checkDell = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
];

exports.del = async (req, res) => {
    const {itemId} = req.body;
    const userId = req.userData.userId;
    await db.delItem(userId, itemId);

    res.json({
        message: 'Item deleted',
    });
}
