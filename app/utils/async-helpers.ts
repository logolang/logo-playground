export async function stay(milliseconds: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(function() {
      resolve();
    }, milliseconds);
  });
}

export interface ErrorDef {
  name: string;
  message: string;
  stack?: string;
}

/**
 * This function is to transform error coming from fetch API to normal error
 */
export async function handleAsyncError(ex: any): Promise<ErrorDef> {
  if (!ex) {
    return new Error();
  }
  if (typeof ex == "string") {
    return new Error(ex);
  }
  if (ex.text && typeof ex.text == "function") {
    const errorText = ex.text();
    if (typeof errorText == "string") {
      // we got an string as an error
      return new Error(errorText);
    }
    if (errorText.then && typeof errorText.then == "function") {
      // we got an promise
      const text = await errorText;
      return new Error(text);
    }
  }
  // Check if this is error object already
  if (typeof ex.name == "string" && typeof ex.message == "string" && typeof ex.stack == "string") {
    return ex;
  }

  return new Error(ex);
}

export async function callActionSafe<R>(
  errorHandler: (errorMessage: string) => void,
  action: () => Promise<R>
): Promise<R | undefined> {
  try {
    return await action();
  } catch (ex) {
    console.error(ex);
    const errorMessage = ex.message || ex.toString();
    errorHandler(errorMessage);
    return undefined;
  }
}
