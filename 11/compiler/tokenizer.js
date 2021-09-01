const SYMBOLS = ['{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~'];
const KEYWORDS = ['class', 'constructor', 'function', 'method', 'field', 'static', 'var', 'int', 'char', 'boolean', 'void', 'true', 'false', 'null', 'this', 'let', 'do', 'if', 'else', 'while', 'return'];
const DIGIT_REGEX = /\d/;
const IDENT_REGEX = /[a-zA-Z0-9_]/;
const STRING_CONTAINER = '"';
const WHITESPACE = [' ', '\r', '\f', '\v', '\n', '\t'];

const voidFunctions = [
    'Math.init',
    'String.dispose',
    'String.setCharAt',
    'String.eraseLastChar',
    'String.setInt',
    'Array.dispose',
    'Output.init',
    'Output.moveCursor',
    'Output.printChar',
    'Output.printString',
    'Output.printInt',
    'Output.println',
    'Output.backSpace',
    'Screen.init',
    'Screen.clearScreen',
    'Screen.setColor',
    'Screen.drawPixel',
    'Screen.drawLine',
    'Screen.drawRectangle',
    'Screen.drawCircle',
    'Keyboard.init',
    'Memory.init',
    'Memory.poke',
    'Memory.deAlloc',
    'Sys.init',
    'Sys.halt',
    'Sys.error',
    'Sys.wait'
];

function tokenize(file) {
    const tokens = [];
    let index = 0;

    while (index < file.length) {
        const char = file.charAt(index);
        let ignore = false;

        if (char === '/') {
            if (file.charAt(index + 1) === '/') {
                ignore = true;
                index = file.indexOf('\n', index) + 1;
            } else if (file.charAt(index + 1) === '*') {
                ignore = true;
                index = file.indexOf('*/', index) + 2;
            }
        }

        if (WHITESPACE.includes(char)) {
            ignore = true;
            index++;
        }

        if (!ignore) {
            if (char === STRING_CONTAINER) {
                const nextIndex = file.indexOf('"', index + 1);
                const string = file.slice(index + 1, nextIndex);
                tokens.push({ type: 'stringConstant', value: string });
                index = nextIndex + 1;
            } else if (SYMBOLS.includes(char)) {
                tokens.push({ type: 'symbol', value: char });
                index++;
            } else if (DIGIT_REGEX.test(char)) {
                let digit = true;
                let endIndex = index;

                while (digit) {
                    endIndex++;
                    digit = DIGIT_REGEX.test(file.charAt(endIndex));
                }

                tokens.push({ type: 'integerConstant', value: file.slice(index, endIndex) });
                index = endIndex;
            } else {
                let isKeyword = false;

                for (let keyword of KEYWORDS) {
                    const text = file.slice(index, index + keyword.length);

                    if (text === keyword) {
                        isKeyword = true;
                        tokens.push({ type: 'keyword', value: text });
                        index += keyword.length;
                        break;
                    }
                }

                if (!isKeyword) {
                    let validChar = true;
                    let endIndex = index;

                    while (validChar) {
                        endIndex++;
                        validChar = IDENT_REGEX.test(file.charAt(endIndex));
                    }

                    tokens.push({ type: 'identifier', value: file.slice(index, endIndex) });
                    index = endIndex;
                }
            }
        }
    }

    for (let i = 0; i < tokens.length; i++) if (tokens[i].value === 'void') voidFunctions.push(`${tokens[1].value}.${tokens[i + 1].value}`);

    return {
        tokens: tokens,
        voidFunctions: voidFunctions
    }
}

module.exports = tokenize;