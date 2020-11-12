const md = require('markdown-it')();

function mdToHtml(text) {
    const env = {};
    const tokens = shortText(md.parse(text, env), 250);
    return md.renderer.render(tokens, md.options, env);
}

function shortText(tokens, limit) {
    const res = short(tokens, limit);
    return res.tokens;
}

function short(tokens, limit) {
    const result = [];
    let depth = 0;
    let overDepth = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (limit > 0) {
            if (token.children !== null) {
                const res = short(token.children, limit);

                limit = res.limit;
                token.children = res.tokens;
            } else if (
                token.type === 'text' ||
                token.type === 'fence' ||
                token.type === 'html_block' ||
                token.type === 'code_block' ||
                token.type === 'html_inline' ||
                token.type === 'emoji'
            ) {
                if (token.content.length < limit) {
                    limit -= token.content.length;
                } else {
                    token.content = token.content.substring(0, limit) + '...';
                    limit = 0;
                }
            } else if (token.type.endsWith('_open')) {
                depth++;
            } else if (token.type.endsWith('_close')) {
                depth--;
            }

            result.push(token);
        } else {
            if (token.type.endsWith('_open')) {
                overDepth++;
            } else if (token.type.endsWith('_close')) {
                if (overDepth > 0) {
                    overDepth--;
                } else {
                    depth--;
                    result.push(token);
                }
            }
        }

        if (limit === 0 && depth === 0) {
            break;
        }
    }

    return {
        tokens: result,
        limit,
    };
}

const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
    } else {
        tokens[idx].attrs[aIndex][1] = '_blank';
    }

    return defaultRender(tokens, idx, options, env, self);
};

module.exports = {
    mdToHtml,
};
