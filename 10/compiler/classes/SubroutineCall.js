const { KEYWORD_CONSTANTS } = require('./constants');

class SubroutineCall {
    constructor(className, subroutineName, tokens) {
        this.className = className;
        this.subroutineName = subroutineName;
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        const expressions = [];
        let index = 0;
        while (index < this.tokens.length) {
            expressions.push(this.tokens[index].value);
            index += 2;
        }
        this.expressions = expressions;
    }

    compileXml() {
        let output = this.className ? `<identifier> ${this.className} </identifier>\n<symbol> . </symbol>\n` : '';
        output += `<identifier> ${this.subroutineName} </identifier>\n<symbol> ( </symbol>\n<expressionList>\n`;
        if (this.expressions.length) {
            output += '<expression>\n<term>\n';
            if (KEYWORD_CONSTANTS.includes(this.expressions[0])) output += `<keyword> ${this.expressions[0]} </keyword>\n`;
            else output += `<identifier> ${this.expressions[0]} </identifier>\n`;
            output += '</term>\n</expression>\n';

            let index = 1;
            while (index < this.expressions.length) {
                output += '<symbol> , </symbol>\n<expression>\n<term>\n';
                if (KEYWORD_CONSTANTS.includes(this.expressions[index])) output += `<keyword> ${this.expressions[index]} </keyword>\n`;
                else output += `<identifier> ${this.expressions[index]} </identifier>\n`;
                output += '</term>\n</expression>\n';
                index++;
            }
        }
        output += '</expressionList>\n<symbol> ) </symbol>\n<symbol> ; </symbol>\n';
        return output;
    }
}

module.exports = SubroutineCall;