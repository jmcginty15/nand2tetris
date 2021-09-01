const { TYPE_KEYWORDS } = require('./constants');

class VarDec {
    constructor(type, firstVarName) {
        this.type = type;
        this.varNames = [firstVarName];
    }

    addVarName(varName) {
        this.varNames.push(varName);
    }

    compileXml() {
        let output = '<varDec>\n<keyword> var </keyword>\n';
        if (TYPE_KEYWORDS.includes(this.type)) output += `<keyword> ${this.type} </keyword>\n`;
        else output += `<identifier> ${this.type} </identifier>\n`;
        output += `<identifier> ${this.varNames[0]} </identifier>\n`;
        let index = 1;
        while (index < this.varNames.length) {
            output += `<symbol> , </symbol>\n<identifier> ${this.varNames[index]} </identifier>\n`;
            index++;
        }
        output += '<symbol> ; </symbol>\n</varDec>\n';
        return output;
    }

    compileVm(symbolTable) {
        for (let varName of this.varNames) symbolTable.define(varName, this.type, 'var');
    }
}

module.exports = VarDec;