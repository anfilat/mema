const jwt = require('jsonwebtoken');
const uuid = require('uuid');

function newTokenPair(userId) {
    const authToken = jwt.sign(
        {userId},
        process.env.APP_JWT_SECRET,
        {expiresIn: +process.env.APP_JWT_EXPIRES}
    );
    const refreshToken = uuid.v4();

    return {
        authToken,
        refreshToken,
    };
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.APP_JWT_SECRET);
    } catch (e) {
        return null;
    }
}

module.exports = {
    newTokenPair,
    verifyToken,
};
