const { KEYWORD_CONSTANTS, OPERATORS, UNARY_OPERATORS } = require('./constants');

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
            let endIndex = index;
            while (endIndex < this.tokens.length && this.tokens[endIndex].value !== ',') endIndex++;
            const expression = new Expression(this.tokens.slice(index, endIndex));
            expressions.push(expression);
            index = endIndex + 1;
        }

        this.expressions = expressions;
    }

    compileXml() {
        let output = this.className ? `<identifier> ${this.className} </identifier>\n<symbol> . </symbol>\n` : '';
        output += `<identifier> ${this.subroutineName} </identifier>\n<symbol> ( </symbol>\n<expressionList>\n`;
        if (this.expressions.length) output += this.expressions[0].compileXml();
        if (this.expressions.length > 1) for (let expression of this.expressions.slice(1)) output += `<symbol> , </symbol>\n${expression.compileXml()}`;
        output += '</expressionList>\n<symbol> ) </symbol>\n';
        return output;
    }

    compileVm(symbolTable) {
        let output = '';
        let className = null;
        let args = this.expressions.length;
        if (this.className) {
            const variable = symbolTable.get(this.className);
            if (variable) {
                className = variable.type;
                const instance = new Term('varName', variable.name);
                output += instance.compileVm(symbolTable);
                args++;
            } else className = this.className;
        } else {
            className = symbolTable.class;
            output += 'push pointer 0\n';
            args++;
        }
        for (let expression of this.expressions) output += expression.compileVm(symbolTable);
        output += `call ${className}.${this.subroutineName} ${args}\n`;
        return output;
    }
}

class Expression {
    constructor(tokens) {
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        const pieces = [];
        let index = 0;
        const tokens = this.tokens

        while (index < this.tokens.length) pieces.push(getNextPiece());

        this.pieces = pieces;

        function getNextPiece() {
            if (['integerConstant', 'stringConstant'].includes(tokens[index].type)) {
                const term = new Term(tokens[index].type, tokens[index].value);
                index++;
                return { type: 'term', value: term };
            } else if (KEYWORD_CONSTANTS.includes(tokens[index].value)) {
                const term = new Term('keywordConstant', tokens[index].value);
                index++;
                return { type: 'term', value: term };
            } else if (OPERATORS.includes(tokens[index].value)) {
                if (UNARY_OPERATORS.includes(tokens[index].value)) {
                    if (tokens[index].value !== '-' || pieces.length === 0 || pieces[pieces.length - 1].type === 'operator') {
                        const operator = tokens[index].value;
                        index++;
                        const term = getNextPiece();
                        term.value.applyUnaryOperator(operator);
                        return term;
                    } else {
                        const symbol = { type: 'operator', value: getSymbol(tokens[index].value) };
                        index++;
                        return symbol;
                    }
                } else {
                    const symbol = { type: 'operator', value: getSymbol(tokens[index].value) };
                    index++;
                    return symbol;
                }
            } else if (tokens[index].type === 'identifier') {
                if (index + 1 < tokens.length && tokens[index + 1].value === '[') {
                    let endIndex = index + 1;
                    let braceDiff = 1;
                    while (braceDiff !== 0) {
                        endIndex++;
                        if (tokens[endIndex].value === '[') braceDiff++;
                        else if (tokens[endIndex].value === ']') braceDiff--;
                    }
                    endIndex++;
                    const term = new Term('arrayName', tokens.slice(index, endIndex));
                    index = endIndex;
                    return { type: 'term', value: term };
                } else if (index + 1 < tokens.length && (tokens[index + 1].value === '.' || tokens[index + 1].value === '(')) {
                    let endIndex = tokens[index + 1].value === '(' ? index + 1 : index + 3;
                    let braceDiff = 1;
                    while (braceDiff !== 0) {
                        endIndex++;
                        if (tokens[endIndex].value === '(') braceDiff++;
                        else if (tokens[endIndex].value === ')') braceDiff--;
                    }
                    endIndex++;
                    const term = new Term('subroutineCall', tokens.slice(index, endIndex));
                    index = endIndex;
                    return { type: 'term', value: term };
                } else {
                    const term = new Term('varName', tokens[index].value);
                    index++;
                    return { type: 'term', value: term };
                }
            } else if (tokens[index].value === '(') {
                let endIndex = index;
                let braceDiff = 1;
                while (braceDiff !== 0) {
                    endIndex++;
                    if (tokens[endIndex].value === '(') braceDiff++;
                    else if (tokens[endIndex].value === ')') braceDiff--;
                }
                endIndex++;
                const term = new Term('expression', tokens.slice(index, endIndex));
                index = endIndex;
                return { type: 'term', value: term };
            }
        }
    }

    compileXml() {
        let output = '<expression>\n';
        for (let piece of this.pieces) {
            if (piece.type === 'term') output += piece.value.compileXml();
            else if (piece.type === 'operator') output += `<symbol> ${piece.value} </symbol>\n`;
        }
        output += '</expression>\n';
        return output;
    }

    compileVm(symbolTable) {
        let output = '';
        let index = 0;
        while (index < this.pieces.length) {
            const piece = this.pieces[index];
            if (piece.type === 'term') {
                output += piece.value.compileVm(symbolTable);
                index++;
            } else if (piece.type === 'operator') {
                output += this.pieces[index + 1].value.compileVm(symbolTable);
                switch (piece.value) {
                    case '+':
                        output += 'add\n';
                        break;
                    case '-':
                        output += 'sub\n';
                        break;
                    case '*':
                        output += 'call Math.multiply 2\n';
                        break;
                    case '/':
                        output += 'call Math.divide 2\n';
                        break;
                    case '&amp;':
                        output += 'and\n';
                        break;
                    case '|':
                        output += 'or\n';
                        break;
                    case '&lt;':
                        output += 'lt\n';
                        break;
                    case '&gt;':
                        output += 'gt\n';
                        break;
                    case '=':
                        output += 'eq\n';
                        break;
                }
                index += 2;
            }
        }
        return output;
    }
}

class Term {
    constructor(type, tokens) {
        this.type = type;
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        if (['integerConstant', 'stringConstant', 'keywordConstant', 'varName'].includes(this.type)) this.value = this.tokens;
        else if (this.type === 'arrayName') {
            this.value = this.tokens[0].value;
            this.expression = new Expression(this.tokens.slice(2, this.tokens.length - 1));
        } else if (this.type === 'subroutineCall') {
            let index = 0;
            let className = null;
            if (this.tokens[1].value === '.') {
                index += 2;
                className = this.tokens[0].value;
            }
            const subroutineName = this.tokens[index].value;
            const tokens = this.tokens.slice(index + 2, this.tokens.length - 1);
            this.value = new SubroutineCall(className, subroutineName, tokens);
        } else if (this.type === 'expression') this.expression = new Expression(this.tokens.slice(1, this.tokens.length - 1));
    }

    applyUnaryOperator(operator) {
        this.operator = operator;
    }

    compileXml() {
        let output = '<term>\n';
        if (this.operator) output += `<symbol> ${this.operator} </symbol>\n<term>\n`;
        if (['integerConstant', 'stringConstant'].includes(this.type)) output += `<${this.type}> ${this.value} </${this.type}>\n`;
        else if (this.type === 'keywordConstant') output += `<keyword> ${this.value} </keyword>\n`;
        else if (this.type === 'varName') output += `<identifier> ${this.value} </identifier>\n`;
        else if (this.type === 'arrayName') output += `<identifier> ${this.value} </identifier>\n<symbol> [ </symbol>\n${this.expression.compileXml()}<symbol> ] </symbol>\n`;
        else if (this.type === 'subroutineCall') output += this.value.compileXml();
        else if (this.type === 'expression') output += `<symbol> ( </symbol>\n${this.expression.compileXml()}<symbol> ) </symbol>\n`;
        if (this.operator) output += '</term>\n';
        output += '</term>\n';
        return output;
    }

    compileVm(symbolTable) {
        let output = '';
        if (this.type === 'expression') output += this.expression.compileVm(symbolTable);
        else if (['integerConstant', 'stringConstant'].includes(this.type)) output += `push constant ${this.value}\n`;
        else if (this.type === 'keywordConstant') {
            if (this.value === 'false' || this.value === 'null') output += 'push constant 0\n';
            else if (this.value === 'true') output += 'push constant 1\nnot\n';
            else if (this.value === 'this') output += 'push pointer 0\n';
        } else if (this.type === 'varName') {
            const variable = symbolTable.get(this.value);
            let segment = 'static';
            if (variable.kind === 'var') segment = 'local';
            else if (variable.kind === 'argument') segment = 'argument';
            else if (variable.kind === 'field') segment = 'this';
            output += `push ${segment} ${variable.num}\n`;
        } else if (this.type === 'arrayName') console.log('butthole');
        else if (this.type === 'subroutineCall') output += this.value.compileVm(symbolTable);
        else if (this.type === 'expression') console.log('butthole');

        if (this.operator === '-') output += 'neg\n';
        else if (this.operator === '~') output += 'not\n';
        return output;
    }
}

function getSymbol(symbol) {
    switch (symbol) {
        case '<':
            return '&lt;';
        case '>':
            return '&gt;';
        case '"':
            return '&quot;';
        case '&':
            return '&amp;';
        default:
            return symbol;
    }
}

module.exports = { SubroutineCall, Expression };