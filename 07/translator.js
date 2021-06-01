const fs = require('fs');
const process = require('process');
translate(process.argv[2]);

function translate(path) {
    const dotIndex = path.indexOf('.');
    if (dotIndex === -1) fs.readdir(path, 'utf-8', function (err, files) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        for (let index in files) translate(`${path}/${files[index]}`);
    });
    else if (path.slice(dotIndex) === '.vm') parseFile(path);
}

function parseFile(path) {
    fs.readFile(path, 'utf-8', function (err, vmFile) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const program = vmFile.split(/\r?\n/);
        const commands = [];

        for (let command of program) {
            // remove leading whitespace
            while (command.charAt(0) === ' ') command = command.slice(1);
            // remove any trailing comments from the command
            const commentIndex = command.indexOf('//');
            if (commentIndex !== -1) command = command.slice(0, commentIndex);
            // remove trailing whitespace
            while (command.slice(-1) === ' ') command = command.slice(0, -1);
            // parse command if it is not an empty line
            if (command !== '') {
                const nextCommand = parse(command);
                commands.push(nextCommand);
            }
        }
        commands.push('(terminationLoop)\n@terminationLoop\n0;JMP');

        const asmFile = commands.join('\n');
        const outputPath = path.slice(0, -3);
        fs.writeFile(`${outputPath}.asm`, asmFile, function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log('translation successful');
        });
    });
}

let returnAddressIndex = 12;
const subroutinesAdded = {
    pushToStack: false,
    popFromStack: false,
    add: false,
    sub: false,
    neg: false,
    eq: false,
    gt: false,
    lt: false,
    and: false,
    or: false,
    not: false
};
const subroutines = {
    pushToStack: '@endPushToStack\n0;JMP\n(pushToStack)\n@SP\nA=M\nM=D\n@SP\nM=M+1\n@R13\nA=M\n0;JMP\n(endPushToStack)\n',
    popFromStack: '@endPopFromStack\n0;JMP\n(popFromStack)\n@SP\nM=M-1\nA=M\nD=M\n@R13\nA=M\n0;JMP\n(endPopFromStack)\n',
    add: '@endAdd\n0;JMP\n(add)\n@returnAddress0\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress0)\n@SP\nM=M-1\nA=M\nM=D+M\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endAdd)\n',
    sub: '@endSub\n0;JMP\n(sub)\n@returnAddress1\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress1)\n@SP\nM=M-1\nA=M\nM=M-D\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endSub)\n',
    neg: '@endNeg\n0;JMP\n(neg)\n@returnAddress2\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress2)\n@SP\nA=M\nM=-D\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endNeg)\n',
    eq: '@endEq\n0;JMP\n(eq)\n@returnAddress3\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress3)\n@R15\nM=D\n@returnAddress4\nD=A\n@R13\nM=D\n@R15\nD=M\n@SP\nM=M-1\nA=M\nD=M-D\n@equals\nD;JEQ\nD=0\n@enterResult\n0;JMP\n(equals)\nD=-1\n(enterResult)\n@pushToStack\n0;JMP\n(returnAddress4)\n@R14\nA=M\n0;JMP\n(endEq)\n',
    gt: '@endGt\n0;JMP\n(gt)\n@returnAddress5\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress5)\n@R15\nM=D\n@returnAddress6\nD=A\n@R13\nM=D\n@R15\nD=M\n@SP\nM=M-1\nA=M\nD=M-D\n@equals\nD;JGT\nD=0\n@enterResult\n0;JMP\n(equals)\nD=-1\n(enterResult)\n@pushToStack\n0;JMP\n(returnAddress6)\n@R14\nA=M\n0;JMP\n(endGt)\n',
    lt: '@endLt\n0;JMP\n(lt)\n@returnAddress7\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress7)\n@R15\nM=D\n@returnAddress8\nD=A\n@R13\nM=D\n@R15\nD=M\n@SP\nM=M-1\nA=M\nD=M-D\n@equals\nD;JLT\nD=0\n@enterResult\n0;JMP\n(equals)\nD=-1\n(enterResult)\n@pushToStack\n0;JMP\n(returnAddress8)\n@R14\nA=M\n0;JMP\n(endLt)\n',
    and: '@endAnd\n0;JMP\n(and)\n@returnAddress9\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress9)\n@SP\nM=M-1\nA=M\nM=D&M\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endAnd)\n',
    or: '@endOr\n0;JMP\n(or)\n@returnAddress10\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress10)\n@SP\nM=M-1\nA=M\nM=D|M\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endOr)\n',
    not: '@endNot\n0;JMP\n(not)\n@returnAddress11\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress11)\n@SP\nA=M\nM=!D\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endNot)\n'
};
const arithmeticKeywords = [
    'add',
    'sub',
    'neg',
    'eq',
    'gt',
    'lt',
    'and',
    'or',
    'not'
];
const memoryAccessKeywords = [
    'push',
    'pop'
];

function parse(command) {
    if (arithmeticKeywords.includes(command.toLowerCase())) return parseArithmeticCommand(command);
    else {
        const pieces = command.split(' ');
        if (memoryAccessKeywords.includes(pieces[0].toLowerCase())) return parseMemoryAccessCommand(...pieces);
    }
}

function parseArithmeticCommand(command) {
    let commandSet = '';

    if (command === 'neg' || command === 'not') {
        if (!subroutinesAdded.popFromStack) {
            commandSet += subroutines.popFromStack;
            subroutinesAdded.popFromStack = true;
        }

        switch (command) {
            case 'neg':
                if (!subroutinesAdded.neg) {
                    commandSet += subroutines.neg;
                    subroutinesAdded.neg = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@neg\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'not':
                if (!subroutinesAdded.not) {
                    commandSet += subroutines.not;
                    subroutinesAdded.not = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@not\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
        }
    } else {
        if (!subroutinesAdded.popFromStack) {
            commandSet += subroutines.popFromStack;
            subroutinesAdded.popFromStack = true;
        }

        switch (command) {
            case 'add':
                if (!subroutinesAdded.add) {
                    commandSet += subroutines.add;
                    subroutinesAdded.add = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@add\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'sub':
                if (!subroutinesAdded.sub) {
                    commandSet += subroutines.sub;
                    subroutinesAdded.sub = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@sub\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'eq':
                if (!subroutinesAdded.eq) {
                    commandSet += subroutines.eq;
                    subroutinesAdded.eq = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@eq\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'gt':
                if (!subroutinesAdded.gt) {
                    commandSet += subroutines.gt;
                    subroutinesAdded.gt = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@gt\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'lt':
                if (!subroutinesAdded.lt) {
                    commandSet += subroutines.lt;
                    subroutinesAdded.lt = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@lt\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'and':
                if (!subroutinesAdded.and) {
                    commandSet += subroutines.and;
                    subroutinesAdded.and = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@and\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
            case 'or':
                if (!subroutinesAdded.or) {
                    commandSet += subroutines.or;
                    subroutinesAdded.or = true;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R14\nM=D\n@or\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
                return commandSet;
        }
    }
}

function parseMemoryAccessCommand(command, segment, index) {
    let commandSet = '';

    switch (command) {
        case 'push':
            if (!subroutinesAdded.pushToStack) {
                commandSet += subroutines.pushToStack;
                subroutinesAdded.pushToStack = true;
            }

            if (segment === 'constant') {
                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${index}\nD=A\n@pushToStack\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
            } else if (segment === 'temp') {
                const a = 5 + parseInt(index);
                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${a}\nD=M\n@pushToStack\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
            } else {
                switch (segment) {
                    case 'local':
                        segmentSymbol = 'LCL';
                        break;
                    case 'argument':
                        segmentSymbol = 'ARG';
                        break;
                    default:
                        segmentSymbol = segment.toUpperCase();
                        break;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${index}\nD=A\n@${segmentSymbol}\nA=D+M\nD=M\n@pushToStack\n0;JMP\n(returnAddress${returnAddressIndex})`;
                returnAddressIndex++;
            }

            return commandSet;
        case 'pop':
            if (!subroutinesAdded.popFromStack) {
                commandSet += subroutines.popFromStack;
                subroutinesAdded.popFromStack = true;
            }

            if (segment === 'temp') {
                const a = 5 + parseInt(index);
                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${a}\nD=A\n@R14\nM=D\n@popFromStack\n0;JMP\n(returnAddress${returnAddressIndex})\n@R14\nA=M\nM=D`;
                returnAddressIndex++;
            } else {
                let segmentSymbol = '';
                switch (segment) {
                    case 'local':
                        segmentSymbol = 'LCL';
                        break;
                    case 'argument':
                        segmentSymbol = 'ARG';
                        break;
                    default:
                        segmentSymbol = segment.toUpperCase();
                        break;
                }

                commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${index}\nD=A\n@${segmentSymbol}\nD=D+M\n@R14\nM=D\n@popFromStack\n0;JMP\n(returnAddress${returnAddressIndex})\n@R14\nA=M\nM=D`;
                returnAddressIndex++;
            }

            return commandSet;
    }
}

function parseProgramFlowCommand(command) {

}

function parseFunctionCallCommand(command) {

}