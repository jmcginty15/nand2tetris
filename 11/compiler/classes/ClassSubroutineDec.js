const ParameterList = require('./ParameterList');
const SubroutineBody = require('./SubroutineBody');

class ClassSubroutineDec {
    constructor(subroutineType, type, subroutineName, voidFunctions) {
        this.subroutineType = subroutineType;
        this.type = type;
        this.subroutineName = subroutineName;
        this.voidFunctions = voidFunctions;
    }

    addParameterList(parameterListTokens) {
        this.parameterList = new ParameterList(parameterListTokens);
    }

    addBody(bodyTokens) {
        this.body = new SubroutineBody(bodyTokens, this.voidFunctions);
    }

    compileXml() {
        let output = `<subroutineDec>\n<keyword> ${this.subroutineType} </keyword>\n`;
        if (this.type === 'void') output += '<keyword> void </keyword>\n';
        else output += `<identifier> ${this.type} </identifier>\n`;
        output += `<identifier> ${this.subroutineName} </identifier>\n<symbol> ( </symbol>\n${this.parameterList.compileXml()}<symbol> ) </symbol>\n${this.body.compileXml()}</subroutineDec>\n`;
        return output;
    }

    compileVm(className, symbolTable) {
        this.parameterList.compileVm(symbolTable)
        let output = `function ${className}.${this.subroutineName} ${this.body.countLocals()}\n`;
        const isVoid = this.type === 'void' ? true : false;
        output += this.body.compileVm(symbolTable, isVoid);
        return output;
    }
}

module.exports = ClassSubroutineDec;