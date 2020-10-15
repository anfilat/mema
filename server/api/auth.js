const {body} = require('express-validator');
const db = require('../db');
const {checkPassword} = require('../helpers/password');
const {newToken, setCookie, delCookie} = require('../helpers/token');

exports.checkRegister = [
    body('email')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({min: 6}).withMessage('The minimum password length is 6 characters'),
];

exports.register = async (req, res) => {
    const {email, password} = req.body;

    const account = await db.addAccount(email, password);

    if (!account) {
        return res
            .status(400)
            .json({message: 'The user already exists'});
    }

    const userId = account.account_id;
    const token = await newToken(userId);
    setCookie(res, token);
    res
        .status(201)
        .json({
            message: 'User created',
            userId,
        });
};

exports.checkLogin = [
    body('email')
        .trim()
        .not().isEmpty().withMessage('Empty email'),
    body('password')
        .trim()
        .not().isEmpty().withMessage('Empty password'),
];

exports.login = async (req, res) => {
    const {email, password} = req.body;

    const account = await db.getAccount(email);

    if (!account) {
        return res
            .status(403)
            .json({message: 'The user is not found'});
    }

    if (!await checkPassword(password, account.password)) {
        return res
            .status(403)
            .json({message: 'Invalid password, try again'});
    }

    const userId = account.account_id;
    const token = await newToken(userId);
    setCookie(res, token);
    res
        .json({
            userId,
        });
};

exports.logout = async (req, res) => {
    await db.delToken(req.userData.token);
    delCookie(res);

    res.json({
        ok: true,
    });
};
