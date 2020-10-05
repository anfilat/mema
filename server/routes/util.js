const {validationResult} = require('express-validator');

function stopOnError(message) {
    return (req, res, next) => {
        const errors = validationResult(req)
            .formatWith(({msg: message, param, value}) => {
                return {
                    message,
                    param,
                    value,
                };
            });

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({
                    errors: errors.array(),
                    message,
                });
        }
        next();
    };
}

module.exports = {
    stopOnError,
};
