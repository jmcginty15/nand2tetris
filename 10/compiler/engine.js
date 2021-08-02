const Class = require('./classes/Class');

function compileTokens(tokens) {
    const output = new Class(tokens[1].value, tokens.slice(3, -1));
    return output.compileXml();
}

module.exports = compileTokens;