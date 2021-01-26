const uuid = require('uuid');
const onHeaders = require('on-headers');
const db = require('../db');

async function newToken() {
    return uuid.v4();
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
        setCookie(res, req.userData.userId, req.userData.token);
    });

    next();
}

const msPerDay = 24 * 60 * 60 * 1000;

function setCookie(res, userId, token) {
    const expires = new Date(Date.now() + process.env.APP_COOKIE_EXPIRES * msPerDay);
    res
        .cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            expires,
        });
    db.addToken(userId, token, expires);
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
