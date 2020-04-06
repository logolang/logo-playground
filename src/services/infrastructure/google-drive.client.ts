import { RandomHelper } from "utils/random";

export interface GoogleFileInfo {
  name: string;
  id: string;
  md5Checksum: string;
  trashed: boolean;
}

export interface GoogleFilesListResponse {
  files: GoogleFileInfo[];
}

// Google API global variable
declare const gapi: unknown;

export class GoogleDriveClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getGapi(): any {
    if (!gapi) {
      throw new Error("Google api is not detected");
    }
    return gapi;
  }

  public async listFiles(query: string): Promise<GoogleFilesListResponse> {
    const response = await this.getGapi().client.drive.files.list({
      fields: "nextPageToken, files(id, name, md5Checksum, trashed)",
      pageSize: 100,
      q: query
    });
    const result: GoogleFilesListResponse = response.result;
    return result;
  }

  public async downloadFileContent(fileId: string): Promise<string> {
    const authToken = this.getGapi().client.getToken();
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const result = await fetch(url, {
      method: "GET",
      headers: new Headers({
        Authorization: authToken.token_type + " " + authToken.access_token
      })
    });
    if (result.ok) {
      return result.text();
    }
    throw new Error("Google drive read error");
  }

  public async uploadNewFile(
    fileName: string,
    fileContent: string,
    fileContentType: string
  ): Promise<void> {
    const authToken = this.getGapi().client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(
      formBoundary,
      fileName,
      fileContent,
      fileContentType
    );
    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    const headers = new Headers();
    headers.append("Authorization", authToken.token_type + " " + authToken.access_token);
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "multipart/related; boundary=" + formBoundary);
    headers.append("Content-Length", requestBody.length.toString());
    await fetch(url, {
      method: "POST",
      headers,
      body: requestBody
    });
  }

  public async updateFile(
    fileId: string,
    fileName: string,
    fileContent: string,
    fileContentType: string
  ): Promise<void> {
    const authToken = this.getGapi().client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(
      formBoundary,
      fileName,
      fileContent,
      fileContentType
    );
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    const headers = new Headers();
    headers.append("Authorization", authToken.token_type + " " + authToken.access_token);
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "multipart/related; boundary=" + formBoundary);
    headers.append("Content-Length", requestBody.length.toString());
    await fetch(url, {
      method: "PATCH",
      headers,
      body: requestBody
    });
  }

  private createFileUploadBody(
    formBoundary: string,
    fileName: string,
    fileContent: string,
    fileContentType: string
  ): string {
    let formData = "";
    formData += "--" + formBoundary + "\n";
    formData += "Content-Type: application/json; charset=UTF-8\n\n";
    formData += JSON.stringify({ name: fileName });
    formData += "\n--" + formBoundary + "\n";
    formData += "Content-Type: " + fileContentType + "\n\n";
    formData += fileContent;
    formData += "\n\n--" + formBoundary + "--\n";
    return formData;
  }
}
