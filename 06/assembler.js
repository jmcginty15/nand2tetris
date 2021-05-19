const fs = require('fs');
const process = require('process');
assemble(process.argv[2]);

// assembler function
function assemble(path) {
    fs.readFile(path, 'utf8', function (err, asmFile) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const program = asmFile.split(/\r?\n/);
        const commands = [];
        for (let line of program) {
            // remove leading whitespace
            while (line.charAt(0) == ' ') line = line.slice(1);
            // remove any trailing comments from the command
            const commentIndex = line.indexOf('//');
            if (commentIndex !== -1) line = line.slice(0, commentIndex);
            // remove trailing whitespace
            while (line.slice(-1) == ' ') line = line.slice(0, -1);
            // parse command if it is not an empty line
            if (line !== '') {
                const command = parse(line);
                if (command) commands.push(command);
            }
        }
        const hackFile = commands.join('\n');

        const outputPath = path.slice(0, -4);
        fs.writeFile(`${outputPath}.hack`, hackFile, function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log('assembly successful');
        });
    });
}

// command parse function
function parse(command) {
    let commandType = 1;
    if (command.charAt(0) == '@') commandType = 0;
    else if (command.charAt(0) == '(' && command.slice(-1) == ')') commandType = 2;

    let binaryCommand = null;
    switch (commandType) {
        case 0:
            binaryCommand = parseACommand(command);
            break;
        case 1:
            binaryCommand = parseCCommand(command);
            break;
        case 2:
            binaryCommand = parseLCommand(command);
            break;
    }

    return binaryCommand;
}

// A command parse function
function parseACommand(command) {
    const val = command.slice(1);
    return `0${binaryString(val)}`;

    // parse numeric value to binary string
    function binaryString(value) {
        const intVal = parseInt(value);
        let binaryVal = (intVal >>> 0).toString(2);
        while (binaryVal.length < 15) binaryVal = `0${binaryVal}`;
        return binaryVal;
    }
}

// C command parse function
function parseCCommand(command) {
    const comp = parseCompute(command);
    const dest = parseDestination(command);
    const jump = parseJump(command);
    return `111${comp}${dest}${jump}`;

    // compute parse function
    function parseCompute(command) {
        const start = command.indexOf('=') + 1;
        const semIndex = command.indexOf(';');
        const end = semIndex === -1 ? command.length : semIndex;
        const comp = command.slice(start, end);
        switch (comp) {
            case '0':
                return '0101010';
            case '1':
                return '0111111';
            case '-1':
                return '0111010';
            case 'D':
                return '0001100';
            case 'A':
                return '0110000';
            case 'M':
                return '1110000';
            case '!D':
                return '0001101';
            case '!A':
                return '0110001';
            case '!M':
                return '1110001';
            case '-D':
                return '0001111';
            case '-A':
                return '0110011';
            case '-M':
                return '1110011';
            case 'D+1':
                return '0011111';
            case 'A+1':
                return '0110111';
            case 'M+1':
                return '1110111';
            case 'D-1':
                return '0001110';
            case 'A-1':
                return '0110010';
            case 'M-1':
                return '1110010';
            case 'D+A':
                return '0000010';
            case 'D+M':
                return '1000010';
            case 'D-A':
                return '0010011';
            case 'D-M':
                return '1010011';
            case 'A-D':
                return '0000111';
            case 'M-D':
                return '1000111';
            case 'D&A':
                return '0000000';
            case 'D&M':
                return '1000000';
            case 'D|A':
                return '0010101';
            case 'D|M':
                return '1010101';
        }
    }

    // destination parse function
    function parseDestination(command) {
        const eqIndex = command.indexOf('=');
        if (eqIndex === -1) return '000';
        else {
            const dest = command.slice(0, eqIndex);
            switch (dest) {
                case 'M':
                    return '001';
                case 'D':
                    return '010';
                case 'MD':
                    return '011';
                case 'A':
                    return '100';
                case 'AM':
                    return '101';
                case 'AD':
                    return '110';
                case 'AMD':
                    return '111';
            }
        }
    }

    // jump parse function
    function parseJump(command) {
        const semIndex = command.indexOf(';');
        if (semIndex === -1) return '000';
        else {
            const jump = command.slice(semIndex + 1);
            switch (jump) {
                case 'JGT':
                    return '001';
                case 'JEQ':
                    return '010';
                case 'JGE':
                    return '011';
                case 'JLT':
                    return '100';
                case 'JNE':
                    return '101';
                case 'JLE':
                    return '110';
                case 'JMP':
                    return '111';
            }
        }
    }
}

// L command parse function
function parseLCommand(command) {
    return null;
}