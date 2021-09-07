class SymbolTable {
    constructor(className) {
        this.class = className;
        this.subroutine = null;
        this.classScope = [];
        this.subroutineScope = [];
        this.classIndices = { static: 0, field: 0 };
        this.subroutineIndices = { argument: 0, var: 0 };
        this.statementIndices = { while: 0, if: 0 };
    }

    define(name, type, kind) {
        const def = { name: name, type: type, kind: kind };
        if (['static', 'field'].includes(kind)) {
            def.num = this.classIndices[kind];
            this.classIndices[kind]++;
            this.classScope.push(def);
        } else if (['argument', 'var'].includes(kind)) {
            def.num = this.subroutineIndices[kind];
            this.subroutineIndices[kind]++;
            this.subroutineScope.push(def);
        }
    }

    get(name) {
        for (let def of this.subroutineScope) if (def.name === name) return def;
        for (let def of this.classScope) if (def.name === name) return def;
        return null;
    }

    countFields() {
        return this.classIndices.field;
    }

    clearSubroutineScope() {
        this.subroutineScope.length = 0;
        this.subroutineIndices.argument = 0;
        this.subroutineIndices.var = 0;
        this.statementIndices.while = 0;
        this.statementIndices.if = 0;
        this.subroutine = null;
    }
}

module.exports = SymbolTable;