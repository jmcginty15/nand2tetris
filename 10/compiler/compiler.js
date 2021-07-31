const fs = require('fs');
const process = require('process');
const tokenize = require('./tokenizer');

class JackAnalyzer {
    constructor(path) {
        this.path = path;
    }

    compile() {
        if (this.path.slice(-5) === '.jack') {
            this.filename = this.path.slice(0, -5);
            const file = fs.readFileSync(this.path, 'utf-8');
            this.tokenize(file);
            this.outputTokens();
        } else {
            const files = fs.readdirSync(this.path, 'utf-8');
            for (let file of files) if (file.slice(-5) === '.jack' || file.indexOf('.') === -1) {
                const nextAnalyzer = new JackAnalyzer(`${this.path}/${file}`);
                nextAnalyzer.compile();
            }
        }
    }

    tokenize(file) {
        this.tokens = tokenize(file);
    }

    outputTokens() {
        let outputText = '<tokens>\n';
        for (let token of this.tokens) {
            let xmlToken = token.value;
            if (['<', '>', '"', '&'].includes(xmlToken)) {
                switch (xmlToken) {
                    case '<':
                        xmlToken = '&lt;';
                        break;
                    case '>':
                        xmlToken = '&gt;';
                        break;
                    case '"':
                        xmlToken = '&quot;';
                        break;
                    case '&':
                        xmlToken = '&amp;';
                        break;
                }
            }

            outputText += `<${token.type}> ${xmlToken} </${token.type}>\n`;
        }
        outputText += '</tokens>';

        const filename = this.filename;
        fs.writeFile(`${filename}T.xml`, outputText, function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`tokenization of ${filename}.jack successful`);
        });
    }
}

const analyzer = new JackAnalyzer(process.argv[2]);
analyzer.compile();
