import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import * as esprima from "esprima";
const PO: any = require("pofile");

interface POFile {
  items: {
    msgid: string;
    msgid_plural: string;
    comments?: string[];
  }[];
  save(fileName: string, callback: () => void): void;
}

type DictionaryLike<V> = { [name: string]: V };

const rootFolder = path.join(process.cwd(), "app");
const regExp = /_T\(([\s\S]*?)\)/g;
const srcFilesGlob = "**/*.@(tsx|ts)";

const poFilenames = ["content/en/messages.po", "content/ru/messages.po"];

glob(srcFilesGlob, { cwd: rootFolder }, (er, files) => {
  if (er) {
    console.error(er);
  } else {
    processFiles(files);
  }
});

interface IMessageEntry {
  msgId: string;
  msgPlural: string;
}

function processFiles(files: string[]) {
  const msgs: DictionaryLike<IMessageEntry> = {};

  files.forEach(f => {
    const filePath = path.join(rootFolder, f);
    if (f.includes(".spec.")) {
      return;
    }

    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    const matches = content.match(regExp);
    if (!matches || matches.length == 0) {
      return;
    }

    matches.forEach(tdef => {
      // Skip declaration of _T function
      if (tdef.includes("options?: ITranslationOptions")) {
        return;
      }

      const tokens = esprima.tokenize(tdef);

      // Here we assume that msgid parameter is at 2nd index
      const msgId = decodeJSString(tokens[2].value);
      let msgPlural = "";

      if (tokens.length > 4) {
        // another assumption that 4 tokens are corresponding only for single parameter call
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
        };
      }
    });
  });

  for (const msgid in msgs) {
    const msg = msgs[msgid];
    console.log("msgid: " + msg.msgId);
    if (msg.msgPlural) {
      console.log("msgidPlural: " + msg.msgPlural);
    }
    console.log();
  }

  for (const poFilename of poFilenames) {
    const poContent = fs.readFileSync(poFilename, "utf-8");
    const poFile = PO.parse(poContent) as POFile;
    console.log(`file ${poFilename}, items: ${poFile.items.length}`);

    // Check for missing keys
    for (const msgid in msgs) {
      const msg = msgs[msgid];
      const match = poFile.items.find(i => i.msgid === msg.msgId);
      if (!match) {
        // Add new item if we do have it
        console.log(` missing key: ${msg.msgId}`);
        const poItem = new PO.Item();
        poItem.msgid = msg.msgId;
        if (msg.msgPlural) {
          poItem.msgid_plural = msg.msgPlural;
        }
        poFile.items.push(poItem);
      } else {
        // Check and update plural expression if it has been changed
        if (match.msgid_plural != msg.msgPlural) {
          if (match.msgid_plural && msg.msgPlural) {
            match.msgid_plural = msg.msgPlural;
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
        // add special comment
        item.comments = item.comments || [];
        if (!item.comments.find((c: string) => c === "REDUNDANT")) {
          item.comments = ["REDUNDANT", ...item.comments];
        }
      } else {
        // remove special comment
        item.comments = item.comments || [];
        item.comments = item.comments.filter(c => c !== "REDUNDANT");
      }
    }

    // Sort item and save file
    poFile.items.sort((i1, i2) => (i1.msgid > i2.msgid ? 1 : -1));
    poFile.save(poFilename, () => {
      console.log("saved");
    });
  }
}

function decodeJSString(encoded: string): string {
  return JSON.parse(encoded);
}
