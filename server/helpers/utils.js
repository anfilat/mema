const _ = require('lodash');

exports.cleanTags = function cleanTags(tags) {
    return _(tags)
        .map(tag => tag.trim())
        .compact()
        .uniq()
        .value();
}

const parseTermsRe = /\s*("[^"]+"|\S+)\s*/g;

exports.parseTerms = function parseTerms(text) {
    return _(text.trim().match(parseTermsRe))
        .map(term => {
            term = term.trim();
            if (term[0] === '"') {
                return term.substring(1, term.length - 1);
            }
            return term;
        })
        .compact()
        .uniq()
        .value();
}
