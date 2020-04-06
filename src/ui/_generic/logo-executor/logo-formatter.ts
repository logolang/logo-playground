function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function wrapSpecialCommandsWithSpaces(code: string) {
  const commands = ["[", "]", "*", "/"];
  const regexp = new RegExp(commands.map(x => "(" + escapeRegExp(x) + ")").join("|"), "g");
  return code.replace(regexp, x => ` ${x} `);
}

function deleteExtraSpaces(code: string) {
  return code.replace(/\s+/g, " ").trim();
}

/**
 * Formats the program by automatically applying indentation and whitespaces around operators
 * @param code Logo program source code
 */
export function formatLogoProgram(code: string) {
  const wrapped = wrapSpecialCommandsWithSpaces(code);
  const arrayOfLines = wrapped.match(/[^\r\n]+/g) || [];
  const trimmedLines = arrayOfLines.map(l => l.trim()).filter(x => Boolean(x));

  /**
   * Increase indentation for lines starting from 'to' or lines ending with '['
   * Decrease indentation for lines starting with end or lines starting with ]
   */
  let currentIndent = 0;
  const resultLines = [];
  for (let lineIndex = 0; lineIndex < trimmedLines.length; ++lineIndex) {
    const line = deleteExtraSpaces(trimmedLines[lineIndex]);
    const nextLine = lineIndex < trimmedLines.length - 1 ? trimmedLines[lineIndex + 1] : "";
    const loline = line.toLowerCase();

    if (loline.startsWith("end") || line.startsWith("]")) {
      currentIndent--;
    }

    if (currentIndent > 0) {
      resultLines.push("  ".repeat(currentIndent) + line);
    } else {
      resultLines.push(line);
    }

    const thisLineEndOfBlock = loline === "]" || loline === "end";
    const loNextLine = nextLine.toLowerCase();
    const nextLineEndOfBlock = loNextLine === "]" || loNextLine === "end";
    if (thisLineEndOfBlock && !nextLineEndOfBlock) {
      resultLines.push("");
    }

    if (loline.startsWith("to") || line.endsWith("[")) {
      currentIndent++;
    }
  }

  return resultLines.join("\n");
}
