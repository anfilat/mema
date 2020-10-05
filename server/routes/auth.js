const jwt = require('jsonwebtoken');
const {body} = require('express-validator');
const config = require('config');
const db = require('../db');
const {checkPassword} = require('../utils/password');

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

    res
        .status(201)
        .json({
            message: 'User created',
            token: newToken(account),
            userId: account.account_id,
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
            .status(400)
            .json({message: 'The user is not found'});
    }

    if (!await checkPassword(password, account.password)) {
        return res
            .status(400)
            .json({message: 'Invalid password, try again'});
    }

    res.json({
        token: newToken(account),
        userId: account.account_id,
    });
};

function newToken(account) {
    return jwt.sign(
        {userId: account.account_id},
        config.get('jwtSecret'),
        {expiresIn: '1h'}
    );
}
