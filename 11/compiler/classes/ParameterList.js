class ParameterList {
    constructor(tokens) {
        this.parameters = [];

        let index = 0;
        while (index < tokens.length) {
            this.parameters.push({ type: tokens[index].value, varName: tokens[index + 1].value });
            index += 3;
        }
    }

    compileXml() {
        let output = '<parameterList>\n';
        if (this.parameters.length) {
            output += `<keyword> ${this.parameters[0].type} </keyword>\n<identifier> ${this.parameters[0].varName} </identifier>\n`;
            let index = 1;
            while (index < this.parameters.length) {
                output += `<symbol> , </symbol>\n<keyword> ${this.parameters[index].type} </keyword>\n<identifier> ${this.parameters[index].varName} </identifier>\n`;
                index++;
            }
        }
        output += '</parameterList>\n';
        return output;
    }

    compileVm(symbolTable) {
        for (let parameter of this.parameters) symbolTable.define(parameter.varName, parameter.type, 'argument');
        return this.parameters.length;
    }
}

module.exports = ParameterList;