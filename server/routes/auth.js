const {body} = require('express-validator');
const db = require('../db');
const {checkPassword} = require('../utils/password');
const {newTokenPair} = require('../utils/jwt');

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
    const {authToken, refreshToken} = newTokenPair(userId);
    await db.addToken(userId, refreshToken);

    res
        .status(201)
        .json({
            message: 'User created',
            authToken,
            refreshToken,
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
    const {authToken, refreshToken} = newTokenPair(userId);
    await db.addToken(userId, refreshToken);

    res.json({
        authToken,
        refreshToken,
        userId,
    });
};

exports.logout = async (req, res) => {
    const userId = req.account.userId;
    await db.delAccountTokens(userId);

    res.json({
        ok: true,
    });
};

exports.checkRefresh = [
    body('refreshToken')
        .trim()
        .not().isEmpty().withMessage('Empty refreshToken'),
];

exports.refresh = async (req, res) => {
    const {refreshToken: oldRefreshToken} = req.body;

    const dbToken = await db.getToken(oldRefreshToken);

    if (!dbToken) {
        return res
            .status(403)
            .json({message: 'Invalid refresh token'});
    }

    await db.delToken(oldRefreshToken);

    const userId = dbToken.account_id;
    const {authToken, refreshToken} = newTokenPair(userId);
    await db.addToken(userId, refreshToken);

    res.json({
        authToken,
        refreshToken,
        userId,
    });
};
