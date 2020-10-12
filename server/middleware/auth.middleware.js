const {verifyToken} = require('../utils/jwt');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
    const account = token ? verifyToken(token) : null;

    if (!account) {
        return res
            .status(401)
            .json({message: 'Unauthorized'});
    }

    req.account = account;

    next();
};
