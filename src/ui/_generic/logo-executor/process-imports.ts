export async function processImports(
  code: string,
  resolver: (moduleName: string) => Promise<string>
): Promise<string> {
  const resultLines = await processImportsRecursive(code, resolver, true);
  return resultLines.join("\n");
}

async function processImportsRecursive(
  code: string,
  resolver: (moduleName: string) => Promise<string>,
  root: boolean
): Promise<string[]> {
  // Split code to lines and trim them
  const arrayOfLines = code.match(/[^\r\n]+/g) || [];
  const resultLines: string[] = [];
  for (const line of arrayOfLines) {
    const linetocheck = line.trimLeft().toLowerCase();
    if (linetocheck.startsWith('import "')) {
      const moduleName = linetocheck.substr(8);
      const resolvedModule = await resolver(moduleName);
      if (resolvedModule) {
        let moduleLines = await processImportsRecursive(resolvedModule, resolver, false);
        if (root) {
          moduleLines = keepOnlyFunctions(moduleLines);
        }
        resultLines.push(...moduleLines);
      }
    } else {
      resultLines.push(line);
    }
  }
  return resultLines;
}

function keepOnlyFunctions(codelines: string[]): string[] {
  const resultLines: string[] = [];
  let isInFunction = false;
  for (const line of codelines) {
    const linetocheck = line.trim().toLowerCase();
    if (linetocheck.startsWith("to ")) {
      isInFunction = true;
    }

    if (isInFunction) {
      resultLines.push(line);
    }

    if (linetocheck.endsWith("end")) {
      isInFunction = false;
    }
  }

  return resultLines;
}
