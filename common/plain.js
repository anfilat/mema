const md = require('markdown-it')();

function mdToPlain(text) {
    const env = {};
    const tokens = md.parse(text, env);
    return plainText(tokens);
}

function plainText(tokens) {
    let text = '';
    let lastCR = false;
    const links = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.children !== null) {
            text += plainText(token.children);
            lastCR = false;
        } else if (
            token.type === 'text' ||
            token.type === 'fence' ||
            token.type === 'html_block' ||
            token.type === 'code_block' ||
            token.type === 'html_inline' ||
            token.type === 'emoji'
        ) {
            text += token.content;
            lastCR = false;
        } else if (token.type === 'link_open') {
            links.push(token);
            text += '[';
        } else if (token.type === 'link_close') {
            const linkOpen = links.pop();
            text += `](${linkOpen.attrs[0][1]})`;
        } else if (/[a-zA-Z]+_close/.test(token.type) && token.block && !lastCR) {
            text += '\n';
            lastCR = true;
        }
    }

    return text.trim();
}

module.exports = {
    mdToPlain,
};
