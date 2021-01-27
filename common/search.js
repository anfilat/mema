const _ = require('lodash');

const parseTermsRe = /\s*("[^"]+"|\S+)\s*/g;

function parseTerms(text) {
    return _(text.trim().match(parseTermsRe))
        .map(term => {
            term = term.trim();
            if (term[0] === '"') {
                return term.substring(1, term.length - 1).trim();
            }
            return term;
        })
        .compact()
        .uniq()
        .value();
}

const isSpaceRe = /\s/;

function stringifyTerms(terms) {
    return _(terms)
        .map(term => {
            term = term.trim();
            if (isSpaceRe.test(term)) {
                return `"${term}"`;
            }
            return term;
        })
        .join(' ');
}

module.exports = {
    parseTerms,
    stringifyTerms,
};
