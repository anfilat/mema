const _ = require('lodash');

exports.cleanTags = function cleanTags(tags) {
    return _(tags)
        .map(tag => tag.trim())
        .compact()
        .uniq()
        .value();
}
