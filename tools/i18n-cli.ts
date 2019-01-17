import * as fs from "fs";
import * as PO from "pofile";

import { $T, Plural, Template } from "../app/i18n/strings";
const poFilenames = ["content/en/strings.po", "content/ru/strings.po"];

// scan the $T object and prepare records for PO file
const newEntries: { [name: string]: PO.Item } = {};
function scanLevel(level: any, parentName: string) {
  for (const [key, val] of Object.entries(level)) {
    const entryName = parentName ? parentName + "." + key : key;
    if (typeof val === "string") {
      const poItem = new PO.Item();
      poItem.msgid = entryName;
      poItem.msgstr = [val];
      newEntries[entryName] = poItem;
    } else if (val instanceof Plural) {
      const poItem = new PO.Item();
      poItem.msgid = entryName;
      poItem.msgstr = val._forms;
      newEntries[entryName] = poItem;
    } else if (val instanceof Template) {
      const poItem = new PO.Item();
      poItem.msgid = entryName;
      poItem.msgstr = [val._template];
      newEntries[entryName] = poItem;
    } else if (typeof val === "object") {
      scanLevel(val, entryName);
    }
  }
}
scanLevel($T, "");

let isMasterFile = true;
for (const poFilename of poFilenames) {
  const poContent = fs.readFileSync(poFilename, "utf-8");
  const poFile = PO.parse(poContent);
  console.log(`File ${poFilename}, items: ${poFile.items.length}`);

  if (isMasterFile) {
    poFile.items = [];
  }

  // Update existing items in translation table
  for (const poEntry of poFile.items) {
    const newEntry = newEntries[poEntry.msgid];
    if (!newEntry) {
      const commentsWithoutRedundant = poEntry.comments.filter(x => x !== "REDUNDANT");
      poEntry.comments = ["REDUNDANT"].concat(commentsWithoutRedundant);
    }
  }

  // Add new items if they do not exist in poFile
  for (const poItem of Object.values(newEntries)) {
    if (!poFile.items.find(x => x.msgid === poItem.msgid)) {
      console.log(`Key ${poItem.msgid} added`);
      poFile.items.push(poItem);
    }
  }

  poFile.items.sort((i1, i2) => (i1.msgid > i2.msgid ? 1 : -1));

  poFile.save(poFilename, () => {
    console.log("saved");
  });

  isMasterFile = false;
}
