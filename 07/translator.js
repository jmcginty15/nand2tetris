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

let returnAddressIndex = 1;
const subroutinesAdded = {
    pushToStack: false,
    popFromStack: false,
    add: false
};
const subroutines = {
    pushToStack: '@endPushToStack\n0;JMP\n(pushToStack)\n@SP\nA=M\nM=D\n@SP\nM=M+1\n@R13\nA=M\n0;JMP\n(endPushToStack)\n',
    popFromStack: '@endPopFromStack\n0;JMP\n(popFromStack)\n@SP\nM=M-1\nA=M\nD=M\n@R13\nA=M\n0;JMP\n(endPopFromStack)\n',
    add: '@endAdd\n0;JMP\n(add)\n@returnAddress0\nD=A\n@R13\nM=D\n@popFromStack\n0;JMP\n(returnAddress0)\n@SP\nM=M-1\nA=M\nM=D+M\n@SP\nM=M+1\n@R14\nA=M\n0;JMP\n(endAdd)\n'
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
    if (command === 'neg' || command === 'not') {
        let commandSet = '';
        if (!subroutinesAdded.popFromStack) {
            commandSet += subroutines.popFromStack;
            subroutinesAdded.popFromStack = true;
        }
    } else {
        let commandSet = '';
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
                return 'butt';
            case 'eq':
                return `${popFromStack1}\n${popFromStack2}\n@equal\nD=D-M\nD;JEQ\n@SP\nM=A\n@endeq\n0;JMP\n(equal)\n@SP\nD=A-1\nM=D\n(endeq)`;
            case 'gt':
                return 'butt';
            case 'lt':
                return 'butt';
            case 'and':
                return 'butt';
            case 'or':
                return 'butt';
        }
    }
}

function parseMemoryAccessCommand(command, segment, index) {
    switch (command) {
        case 'push':
            let commandSet = '';
            if (!subroutinesAdded.pushToStack) {
                commandSet += subroutines.pushToStack;
                subroutinesAdded.pushToStack = true;
            }

            switch (segment) {
                case 'argument':
                    console.log(segment);
                    break;
                case 'local':
                    console.log(segment);
                    break;
                case 'static':
                    console.log(segment);
                    break;
                case 'constant':
                    commandSet += `@returnAddress${returnAddressIndex}\nD=A\n@R13\nM=D\n@${index}\nD=A\n@pushToStack\n0;JMP\n(returnAddress${returnAddressIndex})`;
                    returnAddressIndex++;
                    return commandSet;
                case 'this':
                    console.log(segment);
                    break;
                case 'that':
                    console.log(segment);
                    break;
                case 'pointer':
                    console.log(segment);
                    break;
                case 'temp':
                    console.log(segment);
                    break;
            }
        case 'pop':
            console.log(segment, index);
            break;
    }
}

function parseProgramFlowCommand(command) {

}

function parseFunctionCallCommand(command) {

}