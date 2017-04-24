import * as glob from 'glob'
import * as fs from 'fs'
import * as path from 'path'
import * as esprima from 'esprima'
import * as pofile from 'pofile'

type DictionaryLike<V> = { [name: string]: V };

const rootFolder = path.join(process.cwd(), 'app');
const regExp = /\b_T\(.*\)/g;
const srcFilesGlob = "**/*.@(tsx|ts)";

const poFilenames = [
    "content/en/messages.po",
    "content/ru/messages.po"
];

glob(srcFilesGlob, { cwd: rootFolder }, (er, files) => {
    if (er) {
        console.error(er);
    }
    else {
        processFiles(files);
    }
});

interface IMessageEntry {
    msgId: string,
    msgPlural: string
}

function processFiles(files: string[]) {
    let msgs: DictionaryLike<IMessageEntry> = {};

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
            const msgId = decodeJSString(tokens[2].value);
            let msgPlural = '';

            if (tokens.length > 4) {
                // another assumption that 4 tokens are corresponding only for sindle parameter call
                const pluralIndex = tokens.findIndex(t => t.value == "plural");
                if (pluralIndex >= 0) {
                    // assume that value for plural is on index+2
                    msgPlural = decodeJSString(tokens[pluralIndex + 2].value);
                }
            }

            if (!msgs[msgId]) {
                msgs[msgId] = {
                    msgId: msgId,
                    msgPlural: msgPlural
                }
            }
        })
    });

    for (let msgid in msgs) {
        const msg = msgs[msgid];
        console.log('msgid: ' + msg.msgId);
        if (msg.msgPlural) {
            console.log('msgidPlural: ' + msg.msgPlural);
        }
        console.log();
    }

    for (const poFilename of poFilenames) {
        const poContent = fs.readFileSync(poFilename, "utf-8");
        const poFile = pofile.parse(poContent);
        console.log(`file ${poFilename}, items: ${poFile.items.length}`)

        // Check for missing keys
        for (let msgid in msgs) {
            const msg = msgs[msgid];
            const match = poFile.items.find(i => i.msgid === msg.msgId);
            if (!match) {
                // Add new item if we do have it
                console.log(` missing key: ${msg.msgId}`);
                let poItem = new pofile.Item();
                poItem.msgid = msg.msgId;
                if (msg.msgPlural) {
                    poItem.msgid_plural = msg.msgPlural;
                }
                poFile.items.push(poItem);
            } else {
                // Check and update plural expression if it has been changed
                if (match.msgid_plural != msg.msgPlural) {
                    if (match.msgid_plural && msg.msgPlural) {
                        match.msgid_plural = msg.msgPlural
                    }
                    if (!msg.msgPlural) {
                        delete match.msgid_plural;
                    }
                }
            }
        }

        // Check for extra keys
        for (const item of poFile.items) {
            if (!msgs[item.msgid]) {
                console.log(` extra key: ${item.msgid}`);
                if (!item.comments || !item.comments.find(c => c === "REDUNDANT")) {
                    item.comments = ["REDUNDANT", ...item.comments || []];
                }
            }
        }

        // Sort item and save file
        poFile.items.sort((i1, i2) => i1.msgid > i2.msgid ? 1 : -1);
        poFile.save(poFilename, () => {
            console.log('saved');
        })
    }
}

function decodeJSString(encoded: string): string {
    const f = new Function('return ' + encoded);
    return f();
}
