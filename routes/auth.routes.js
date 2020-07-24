const {Router} = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {body} = require('express-validator');
const db = require('../db');
const {stopOnError} = require('./util');

const router = Router();

// /api/auth/register
if (config.get('register') === 'yes') {
    router.post(
        '/register',
        [
            body('email')
                .isEmail().withMessage('Некорректный email'),
            body('password')
                .isLength({min: 6}).withMessage('Минимальная длина пароля 6 символов'),
            stopOnError('Некорректные данные при регистрации'),
        ],
        async (req, res) => {
            const {email, password} = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const ok = await db.addAccount(email, hashedPassword);

            if (ok) {
                return res
                    .status(201)
                    .json({message: 'Пользователь создан'});
            }
            res
                .status(400)
                .json({message: 'Такой пользователь уже существует'});
        }
    );
}

// /api/auth/login
router.post(
    '/login',
    [
        body('email')
            .trim()
            .not().isEmpty().withMessage('Введите email'),
        body('password')
            .trim()
            .not().isEmpty().withMessage('Введите пароль'),
        stopOnError('Некорректные данные при входе в систему'),
    ],
    async (req, res) => {
        const {email, password} = req.body;

        const account = await db.getAccount(email);

        if (!account) {
            return res
                .status(400)
                .json({message: 'Пользователь не найден'});
        }

        const isMatch = await bcrypt.compare(password, account.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({message: 'Неверный пароль, попробуйте снова'});
        }

        const token = jwt.sign(
            {userId: account.account_id},
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        );

        res.json({token, userId: account.account_id});
    }
);

router.use((err, req, res, next) => {
    res
        .status(500)
        .json({message: 'Что-то пошло не так, попробуйте снова'});
});

module.exports = router;
