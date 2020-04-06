const ServerErrorName = "Server error";
const ServerErrorDetailsNotAvailable = "Error details are not available";
const ConnectionError = "Unable to connect to server. Please contact your administrator.";

export interface ErrorDef extends Error {
  isResponse?: boolean;
  httpStatusCode?: number;
}

function buildResponseError(name: string, status: number, message: string): Error {
  const error = new Error(message) as ErrorDef;
  error.isResponse = true;
  error.name = name;
  error.httpStatusCode = status;
  return error;
}

/**
 * This function is to transform error coming from fetch API to normal error
 */
export async function normalizeError(ex: unknown): Promise<ErrorDef> {
  if (!ex) {
    return new Error();
  }

  if (ex instanceof Error) {
    if (ex.message && ex.message.indexOf("Failed to fetch") >= 0) {
      return new Error(ConnectionError);
    } else {
      return ex;
    }
  }

  //check if coming from response object
  if (ex instanceof Response) {
    let responseText = "";
    try {
      responseText = await ex.text();
    } catch (exception) {
      return buildResponseError(ServerErrorName, ex.status, ServerErrorDetailsNotAvailable);
    }

    if (!responseText) {
      return buildResponseError(ServerErrorName, ex.status, ServerErrorDetailsNotAvailable);
    }

    let responseError;
    try {
      responseError = JSON.parse(responseText);
    } catch (exception) {
      return buildResponseError(ServerErrorName, ex.status, "Error details: " + responseText);
    }

    return buildResponseError(
      ServerErrorName,
      ex.status,
      responseError.error ||
        responseError.message ||
        responseError.errorMessage ||
        ServerErrorDetailsNotAvailable
    );
  }

  // Just use toString for all other errors
  return new Error("Error: " + JSON.stringify(ex, undefined, 4));
}

export async function callActionSafe<R>(
  onError: (error: ErrorDef) => void,
  action: () => Promise<R>
): Promise<R | undefined> {
  try {
    return await action();
  } catch (ex) {
    console.error(ex);
    const normalizedError = await normalizeError(ex);
    onError(normalizedError);
    return undefined;
  }
}
