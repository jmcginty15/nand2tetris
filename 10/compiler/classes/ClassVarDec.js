const { TYPE_KEYWORDS } = require('./constants');

class ClassVarDec {
    constructor(varType, type, firstVarName) {
        this.varType = varType;
        this.type = type;
        this.varNames = [firstVarName];
    }

    addVarName(varName) {
        this.varNames.push(varName);
    }

    compileXml() {
        let output = `<classVarDec>\n<keyword> ${this.varType} </keyword>\n`;
        if (TYPE_KEYWORDS.includes(this.type)) output += `<keyword> ${this.type} </keyword>\n`;
        else output += `<identifier> ${this.type} </identifier>\n`;
        output += `<identifier> ${this.varNames[0]} </identifier>\n`;
        let index = 1;
        while (index < this.varNames.length) {
            output += `<symbol> , </symbol>\n<identifier> ${this.varNames[index]} </identifier>\n`;
            index++;
        }
        output += '<symbol> ; </symbol>\n</classVarDec>\n';
        return output;
    }
}

module.exports = ClassVarDec;