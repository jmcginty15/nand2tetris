const ClassVarDec = require('./ClassVarDec');
const ClassSubroutineDec = require('./ClassSubroutineDec');
const SymbolTable = require('../SymbolTable');
const { VAR_DEC_KEYWORDS, SUBROUTINE_DEC_KEYWORDS } = require('./constants');

class Class {
    constructor(className, tokens) {
        this.className = className;
        this.tokens = tokens;
        this.symbolTable = new SymbolTable();
        this.compile();
    }

    compile() {
        const varDecs = [];
        const subroutineDecs = [];
        let index = 0;

        while (VAR_DEC_KEYWORDS.includes(this.tokens[index].value)) {
            const nextVarDec = new ClassVarDec(this.tokens[index].value, this.tokens[index + 1].value, this.tokens[index + 2].value);
            index += 3;
            while (this.tokens[index].value === ',') {
                nextVarDec.addVarName(this.tokens[index + 1].value);
                index += 2;
            }
            index++;
            varDecs.push(nextVarDec);
        }

        while (index < this.tokens.length && SUBROUTINE_DEC_KEYWORDS.includes(this.tokens[index].value)) {
            const nextSubroutineDec = new ClassSubroutineDec(this.tokens[index].value, this.tokens[index + 1].value, this.tokens[index + 2].value);
            index += 4;
            let endIndex = index;
            while (this.tokens[endIndex].value !== ')') endIndex++;
            nextSubroutineDec.addParameterList(this.tokens.slice(index, endIndex));
            index = endIndex + 1;
            endIndex = index;
            let braceDiff = 1;
            while (braceDiff !== 0) {
                endIndex++;
                if (this.tokens[endIndex].value === '{') braceDiff++;
                else if (this.tokens[endIndex].value === '}') braceDiff--;
            }
            nextSubroutineDec.addBody(this.tokens.slice(index + 1, endIndex));
            index = endIndex + 1;
            subroutineDecs.push(nextSubroutineDec);
        }

        this.varDecs = varDecs;
        this.subroutineDecs = subroutineDecs;
    }

    compileXml() {
        let output = `<class>\n<keyword> class </keyword>\n<identifier> ${this.className} </identifier>\n<symbol> { </symbol>\n`;
        for (let varDec of this.varDecs) output += varDec.compileXml();
        for (let subroutineDec of this.subroutineDecs) output += subroutineDec.compileXml();
        output += '<symbol> } </symbol>\n</class>\n';
        return output;
    }

    compileVm() {
        let output = '';
        // for (let varDec of this.varDecs) output += varDec.compileVm(this.symbolTable);
        for (let subroutineDec of this.subroutineDecs) output += subroutineDec.compileVm(this.className, this.symbolTable);
        return output;
    }
}

module.exports = Class;