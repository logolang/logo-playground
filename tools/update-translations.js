
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

const rootFolder = path.join(process.cwd(), 'app');
const regExp = /\b_T\(.*\)/g;
const srcFilesGlob = "**/*.@(tsx|ts)";

glob(srcFilesGlob, { cwd: rootFolder }, (er, files) => {
    if (er) {
        console.error(er);
    }
    else {
        processFiles(files);
    }
});

function processFiles(files) {
    let msgs = {};

    files.forEach(f => {
        const filePath = path.join(rootFolder, f);
        if (f.includes('.spec.')) { return; }

        const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
        const matches = content.match(regExp);
        if (!matches || matches.length == 0) { return; }

        matches.forEach(tdef => {
            if (tdef.includes('ITranslationOptions')) { return; }

            const tokens = esprima.tokenize(tdef);

            // Here we assume that msgid parameter is at 2nd index
            const msgid = decodeJSString(tokens[2].value);
            let msgPlural = '';

            if (tokens.length > 4) { // another assumption that 4 tokens are corresponding only for sindle parameter call
                const pluralIndex = tokens.findIndex(t => t.value == "plural");
                if (pluralIndex >= 0) {
                    // assume that value for plural is on index+2
                    msgPlural = decodeJSString(tokens[pluralIndex + 2].value);
                }
            }

            if (!msgs[msgid]) {
                msgs[msgid] = {
                    msgid: msgid,
                    msgPlural: msgPlural
                }
            }
        })
    });

    for (let msgid in msgs) {
        const msg = msgs[msgid];
        console.log('msgid: ' + msg.msgid);
        if (msg.msgPlural) {
            console.log('msgidPlural: ' + msg.msgPlural);
        }
        console.log();
    }
}

function decodeJSString(encoded) {
    const f = new Function('return ' + encoded);
    return f();
}
