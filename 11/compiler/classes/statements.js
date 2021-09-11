const { SubroutineCall, Expression } = require('./expressions');
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
                    var endIndex = index + 1;
                    var braceDiff = 1;
                    while (braceDiff !== 0) {
                        endIndex++;
                        if (this.tokens[endIndex].value === '[') braceDiff++;
                        else if (this.tokens[endIndex].value === ']') braceDiff--;
                    }
                    endIndex++;
                    arrayIndexExpression = this.tokens.slice(index + 2, endIndex - 1);
                    index = endIndex;
                }
                while (this.tokens[index].value !== '=') index++;
                index++;
                var endIndex = index;
                while (this.tokens[endIndex].value !== ';') endIndex++;
                const expression = this.tokens.slice(index, endIndex);
                this.statement = new LetStatement(varName, arrayIndexExpression, expression);
                break;
            case 'if':
                var braceDiff = 1;
                var endIndex = index;
                while (braceDiff !== 0) {
                    endIndex++;
                    if (this.tokens[endIndex].value === '(') braceDiff++;
                    else if (this.tokens[endIndex].value === ')') braceDiff--;
                }
                const ifCondition = this.tokens.slice(index + 1, endIndex);

                index = endIndex + 1;
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
                var braceDiff = 1;
                var endIndex = index;
                while (braceDiff !== 0) {
                    endIndex++;
                    if (this.tokens[endIndex].value === '(') braceDiff++;
                    else if (this.tokens[endIndex].value === ')') braceDiff--;
                }
                const whileCondition = this.tokens.slice(index + 1, endIndex);

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

    compileVm(symbolTable, isMethod) {
        if (this.statement) return this.statement.compileVm(symbolTable, isMethod);
    }
}

class LetStatement {
    constructor(varName, arrayIndexTokens, expressionTokens) {
        this.varName = varName;
        this.arrayIndexTokens = arrayIndexTokens;
        this.expressionTokens = expressionTokens;
        this.compile();
    }

    compile() {
        if (this.arrayIndexTokens) this.arrayIndexExpression = new Expression(this.arrayIndexTokens);
        this.expression = new Expression(this.expressionTokens);
    }

    compileXml() {
        let output = `<letStatement>\n<keyword> let </keyword>\n<identifier> ${this.varName} </identifier>\n`;
        if (this.arrayIndexTokens) output += `<symbol> [ </symbol>\n${this.arrayIndexExpression.compileXml()}<symbol> ] </symbol>\n`;
        output += `<symbol> = </symbol>\n${this.expression.compileXml()}<symbol> ; </symbol>\n</letStatement>\n`;
        return output;
    }

    compileVm(symbolTable, isMethod) {
        let output = this.expression.compileVm(symbolTable, isMethod);
        const variable = symbolTable.get(this.varName);
        let segment = 'static';
        if (variable.kind === 'var') segment = 'local';
        else if (variable.kind === 'argument') segment = 'argument';
        else if (variable.kind === 'field') segment = 'this';
        if (variable.type === 'Array' && this.arrayIndexExpression) output += `push ${segment} ${variable.num}\n${this.arrayIndexExpression.compileVm(symbolTable, isMethod)}add\npop pointer 1\npop that 0\n`;
        else output += `pop ${segment} ${variable.num}\n`;
        return output;
    }
}

class IfStatement {
    constructor(conditionTokens, ifTokens, elseTokens) {
        this.conditionTokens = conditionTokens;
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

        this.condition = new Expression(this.conditionTokens);
        this.ifStatements = ifStatements;
        this.elseStatements = elseStatements;
    }

    compileXml() {
        let output = `<ifStatement>\n<keyword> if </keyword>\n<symbol> ( </symbol>\n${this.condition.compileXml()}<symbol> ) </symbol>\n<symbol> { </symbol>\n<statements>\n`;
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

    compileVm(symbolTable, isMethod) {
        const label = `${symbolTable.class}.${symbolTable.subroutine}.if_${symbolTable.statementIndices.if}_`;
        symbolTable.statementIndices.if++;
        let output = this.condition.compileVm(symbolTable, isMethod);
        output += `not\nif-goto ${label}${this.elseTokens ? 'else' : 'end'}\n`;
        for (let statement of this.ifStatements) output += statement.compileVm(symbolTable, isMethod);
        if (this.elseTokens) output += `goto ${label}end\nlabel ${label}else\n`;
        for (let statement of this.elseStatements) output += statement.compileVm(symbolTable, isMethod);
        output += `label ${label}end\n`;
        return output;
    }
}

class WhileStatement {
    constructor(conditionTokens, tokens) {
        this.conditionTokens = conditionTokens;
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

        this.condition = new Expression(this.conditionTokens);
        this.statements = statements;
    }

    compileXml() {
        let output = `<whileStatement>\n<keyword> while </keyword>\n<symbol> ( </symbol>\n${this.condition.compileXml()}<symbol> ) </symbol>\n<symbol> { </symbol>\n<statements>\n`;
        for (let statement of this.statements) output += statement.compileXml();
        output += '</statements>\n<symbol> } </symbol>\n</whileStatement>\n';
        return output;
    }

    compileVm(symbolTable, isMethod) {
        const label = `${symbolTable.class}.${symbolTable.subroutine}.while_${symbolTable.statementIndices.while}_`;
        symbolTable.statementIndices.while++;
        let output = `label ${label}start\n`;
        output += this.condition.compileVm(symbolTable, isMethod);
        output += `not\nif-goto ${label}end\n`;
        for (let statement of this.statements) output += statement.compileVm(symbolTable, isMethod);
        output += `goto ${label}start\n`;
        output += `label ${label}end\n`;
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
        this.subroutine = new SubroutineCall(className, subroutineName, this.tokens.slice(index + 1, this.tokens.length - 2));
    }

    compileXml() {
        return `<doStatement>\n<keyword> do </keyword>\n${this.subroutine.compileXml()}<symbol> ; </symbol>\n</doStatement>\n`;
    }

    compileVm(symbolTable, isMethod) {
        return `${this.subroutine.compileVm(symbolTable, isMethod)}pop temp 0\n`;
    }
}

class ReturnStatement {
    constructor(tokens) {
        this.tokens = tokens;
        this.compile()
    }

    compile() {
        if (this.tokens.length) this.expression = new Expression(this.tokens);
    }

    compileXml() {
        let output = '<returnStatement>\n<keyword> return </keyword>\n';
        if (this.expression) output += this.expression.compileXml();
        output += '<symbol> ; </symbol>\n</returnStatement>\n';
        return output;
    }

    compileVm(symbolTable, isMethod) {
        let output = '';
        if (this.expression) output += this.expression.compileVm(symbolTable, isMethod);
        output += 'return\n';
        return output;
    }
}

module.exports = Statement;