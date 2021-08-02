const SubroutineCall = require('./SubroutineCall');
const { STATEMENT_KEYWORDS } = require('./constants');

class Statement {
    constructor(keyword, tokens) {
        this.keyword = keyword;
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        let index = 0;
        switch (this.keyword) {
            case 'let':
                const varName = this.tokens[index].value;
                let arrayIndexExpression = null;
                if (this.tokens[index + 1].value === '[') {
                    arrayIndexExpression = this.tokens[index + 2].value;
                }
                while (this.tokens[index].value !== '=') index++;
                const expression = this.tokens[index + 1].value;
                this.statement = new LetStatement(varName, arrayIndexExpression, expression);
                break;
            case 'if':
                const ifCondition = this.tokens[index + 1].value;

                while (this.tokens[index].value !== '{') index++;
                var endIndex = index;
                var braceDiff = 1;
                while (braceDiff !== 0) {
                    endIndex++;
                    if (this.tokens[endIndex].value === '{') braceDiff++;
                    else if (this.tokens[endIndex].value === '}') braceDiff--;
                }
                const ifBody = this.tokens.slice(index + 1, endIndex);

                index = endIndex + 1;
                let elseBody = null;
                if (index < this.tokens.length) {
                    while (this.tokens[index].value !== '{') index++;
                    var endIndex = index;
                    var braceDiff = 1;
                    while (braceDiff !== 0) {
                        endIndex++;
                        if (this.tokens[endIndex].value === '{') braceDiff++;
                        else if (this.tokens[endIndex].value === '}') braceDiff--;
                    }
                    elseBody = this.tokens.slice(index + 1, endIndex);
                }

                this.statement = new IfStatement(ifCondition, ifBody, elseBody);
                break;
            case 'while':
                const whileCondition = this.tokens[index + 1].value;

                while (this.tokens[index].value !== '{') index++;
                var endIndex = index;
                var braceDiff = 1;
                while (braceDiff !== 0) {
                    endIndex++;
                    if (this.tokens[endIndex].value === '{') braceDiff++;
                    else if (this.tokens[endIndex].value === '}') braceDiff--;
                }
                const whileBody = this.tokens.slice(index + 1, endIndex);

                this.statement = new WhileStatement(whileCondition, whileBody);
                break;
            case 'do':
                this.statement = new DoStatement(this.tokens);
                break;
            case 'return':
                var endIndex = index;
                while (this.tokens[endIndex].value !== ';') endIndex++;
                this.statement = new ReturnStatement(this.tokens.slice(index, endIndex));
                break;
        }
    }

    compileXml() {
        if (this.statement) return this.statement.compileXml();
    }
}

class LetStatement {
    constructor(varName, arrayIndexExpression, expression) {
        this.varName = varName;
        this.arrayIndexExpression = arrayIndexExpression;
        this.expression = expression;
    }

    compileXml() {
        let output = `<letStatement>\n<keyword> let </keyword>\n<identifier> ${this.varName} </identifier>\n`;
        if (this.arrayIndexExpression) output += `<symbol> [ </symbol>\n<expression>\n<term> ${this.arrayIndexExpression} </term>\n</expression>\n<symbol> ] </symbol>\n`;
        output += `<symbol> = </symbol>\n<expression>\n<term>\n<identifier> ${this.expression} </identifier>\n</term>\n</expression>\n<symbol> ; </symbol>\n</letStatement>\n`;
        return output;
    }
}

class IfStatement {
    constructor(condition, ifTokens, elseTokens) {
        this.condition = condition;
        this.ifTokens = ifTokens;
        this.elseTokens = elseTokens;
        this.compile();
    }

    compile() {
        const ifStatements = [];
        const elseStatements = [];
        let index = 0;

        while (index < this.ifTokens.length && STATEMENT_KEYWORDS.includes(this.ifTokens[index].value)) {
            let endIndex = index + 1;
            let braceDiff = 0;
            while (endIndex < this.ifTokens.length) {
                if (this.ifTokens[endIndex].value === '{') braceDiff++;
                else if (this.ifTokens[endIndex].value === '}') braceDiff--;
                if (braceDiff === 0 && STATEMENT_KEYWORDS.includes(this.ifTokens[endIndex].value)) break;
                endIndex++;
            }
            const statementBody = this.ifTokens.slice(index + 1, endIndex);
            ifStatements.push(new Statement(this.ifTokens[index].value, statementBody));
            index = endIndex;
        }

        if (this.elseTokens) {
            index = 0;

            while (index < this.elseTokens.length && STATEMENT_KEYWORDS.includes(this.elseTokens[index].value)) {
                let endIndex = index + 1;
                let braceDiff = 0;
                while (endIndex < this.elseTokens.length) {
                    if (this.elseTokens[endIndex].value === '{') braceDiff++;
                    else if (this.elseTokens[endIndex].value === '}') braceDiff--;
                    if (braceDiff === 0 && STATEMENT_KEYWORDS.includes(this.elseTokens[endIndex].value)) break;
                    endIndex++;
                }
                const statementBody = this.elseTokens.slice(index + 1, endIndex);
                elseStatements.push(new Statement(this.elseTokens[index].value, statementBody));
                index = endIndex;
            }
        }

        this.ifStatements = ifStatements;
        this.elseStatements = elseStatements;
    }

    compileXml() {
        let output = `<ifStatement>\n<keyword> if </keyword>\n<symbol> ( </symbol>\n<expression>\n<term>\n<identifier> ${this.condition} </identifier>\n</term>\n</expression>\n<symbol> ) </symbol>\n<symbol> { </symbol>\n<statements>\n`;
        for (let statement of this.ifStatements) output += statement.compileXml();
        output += '</statements>\n<symbol> } </symbol>\n';
        if (this.elseTokens) {
            output += '<keyword> else </keyword>\n<symbol> { </symbol>\n<statements>\n';
            for (let statement of this.elseStatements) output += statement.compileXml();
            output += '</statements>\n<symbol> } </symbol>\n';
        }
        output += '</ifStatement>\n';
        return output;
    }
}

class WhileStatement {
    constructor(condition, tokens) {
        this.condition = condition;
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        const statements = [];
        let index = 0;

        while (index < this.tokens.length && STATEMENT_KEYWORDS.includes(this.tokens[index].value)) {
            let endIndex = index + 1;
            let braceDiff = 0;
            while (endIndex < this.tokens.length) {
                if (this.tokens[endIndex].value === '{') braceDiff++;
                else if (this.tokens[endIndex].value === '}') braceDiff--;
                if (braceDiff === 0 && STATEMENT_KEYWORDS.includes(this.tokens[endIndex].value)) break;
                endIndex++;
            }
            const statementBody = this.tokens.slice(index + 1, endIndex);
            statements.push(new Statement(this.tokens[index].value, statementBody));
            index = endIndex;
        }

        this.statements = statements;
    }

    compileXml() {
        let output = `<whileStatement>\n<keyword> while </keyword>\n<symbol> ( </symbol>\n<expression>\n<term>\n<identifier> ${this.condition} </identifier>\n</term>\n</expression>\n<symbol> ) </symbol>\n<symbol> { </symbol>\n<statements>\n`;
        for (let statement of this.statements) output += statement.compileXml();
        output += '</statements>\n<symbol> } </symbol>\n</whileStatement>\n';
        return output;
    }
}

class DoStatement {
    constructor(tokens) {
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        let className = null;
        let index = 0;
        if (this.tokens[1].value === '.') {
            className = this.tokens[0].value;
            index = 2;
        }
        const subroutineName = this.tokens[index].value;

        while (this.tokens[index].value !== '(') index++;
        let endIndex = index;
        while (this.tokens[endIndex].value !== ')') endIndex++;

        this.subroutine = new SubroutineCall(className, subroutineName, this.tokens.slice(index + 1, endIndex));
    }

    compileXml() {
        return `<doStatement>\n<keyword> do </keyword>\n${this.subroutine.compileXml()}</doStatement>\n`;
    }
}

class ReturnStatement {
    constructor(tokens) {
        this.tokens = tokens;
    }

    compile() {

    }

    compileXml() {
        let output = '<returnStatement>\n<keyword> return </keyword>\n';
        if (this.tokens.length) output += `<expression>\n<term>\n<identifier> ${this.tokens[0].value} </identifier>\n</term>\n</expression>\n`;
        output += '<symbol> ; </symbol>\n</returnStatement>\n';
        return output;
    }
}

module.exports = Statement;