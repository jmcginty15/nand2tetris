const VarDec = require('./VarDec');
const Statement = require('./statements');
const { STATEMENT_KEYWORDS } = require('./constants');

class SubroutineBody {
    constructor(tokens) {
        this.tokens = tokens;
        this.compile();
    }

    compile() {
        const varDecs = [];
        const statements = [];
        let index = 0;

        while (this.tokens[index].value === 'var') {
            const nextVarDec = new VarDec(this.tokens[index + 1].value, this.tokens[index + 2].value);
            index += 3;
            while (this.tokens[index].value === ',') {
                nextVarDec.addVarName(this.tokens[index + 1].value);
                index += 2;
            }
            index++;
            varDecs.push(nextVarDec);
        }

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

        this.varDecs = varDecs;
        this.statements = statements;
    }

    compileXml() {
        let output = '<subroutineBody>\n<symbol> { </symbol>\n';
        for (let varDec of this.varDecs) output += `${varDec.compileXml()}`;
        output += '<statements>\n';
        for (let statement of this.statements) if (statement) output += statement.compileXml();
        output += '</statements>\n<symbol> } </symbol>\n</subroutineBody>\n';
        return output;
    }

    compileVm(symbolTable) {
        let output = '';
        // for (let varDec of this.varDecs) output += varDec.compileVm();
        for (let statement of this.statements) output += statement.compileVm(symbolTable);
        // console.log(this);
        // console.log(symbolTable);
        return output;
    }
}

module.exports = SubroutineBody;