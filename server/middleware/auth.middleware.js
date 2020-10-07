const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            return res
                .status(401)
                .json({message: 'Unauthorized'});
        }

        req.account = jwt.verify(token, process.env.APP_JWT_SECRET);
        next();
    } catch (e) {
        res
            .status(401)
            .json({message: 'Unauthorized'});
    }
};
