const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body} = require('express-validator');
const db = require('../db');

exports.checkRegister = [
    body('email')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({min: 6}).withMessage('The minimum password length is 6 characters'),
];

exports.register = async (req, res) => {
    const {email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const ok = await db.addAccount(email, hashedPassword);

    if (ok) {
        return res
            .status(201)
            .json({message: 'User created'});
    }
    res
        .status(400)
        .json({message: 'The user already exists'});
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

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
        return res
            .status(400)
            .json({message: 'Invalid password, try again'});
    }

    const token = jwt.sign(
        {userId: account.account_id},
        config.get('jwtSecret'),
        {expiresIn: '1h'}
    );

    res.json({token, userId: account.account_id});
};
