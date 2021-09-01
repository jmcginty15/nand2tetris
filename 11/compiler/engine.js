const Class = require('./classes/Class');

function compileTokens(tokens, voidFunctions) {
    const output = new Class(tokens[1].value, tokens.slice(3, -1), voidFunctions);
    return {
        xml: output.compileXml(),
        vm: output.compileVm()
    }
}

module.exports = compileTokens;