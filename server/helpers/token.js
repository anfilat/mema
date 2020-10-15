const uuid = require('uuid');
const onHeaders = require('on-headers');
const db = require('../db');

async function newToken(userId) {
    const token = uuid.v4();
    await db.addToken(userId, token);

    return token;
}

async function checkAuth(req, res, next) {
    const token = req.cookies.token;
    const data = token ? await db.getToken(token) : null;

    if (!data) {
        return res
            .status(401)
            .json({message: 'Unauthorized'});
    }

    req.userData = data;

    next();
}

function refreshCookie(req, res, next) {
    onHeaders(res, function() {
        if (res.statusCode !== 200) {
            return;
        }
        setCookie(res, req.userData.token);
    });

    next();
}

function setCookie(res, token) {
    res
        .cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: process.env.APP_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        });
}

function delCookie(res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
    });
}

module.exports = {
    newToken,
    checkAuth,
    refreshCookie,
    setCookie,
    delCookie,
};
