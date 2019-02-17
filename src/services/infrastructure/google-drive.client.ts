import { RandomHelper } from "utils/random";

export interface IGoogleFileInfo {
  name: string;
  id: string;
  md5Checksum: string;
  trashed: boolean;
}

export interface IGoogleFilesListResponse {
  files: IGoogleFileInfo[];
}

export class GoogleDriveClient {
  private get gapi(): any {
    const globalGapi = (window as any).gapi;
    if (!globalGapi) {
      throw new Error("Google api is not detected");
    }
    return globalGapi;
  }

  public async listFiles(query: string): Promise<IGoogleFilesListResponse> {
    const response = await this.gapi.client.drive.files.list({
      fields: "nextPageToken, files(id, name, md5Checksum, trashed)",
      pageSize: 100,
      q: query
    });
    const result: IGoogleFilesListResponse = response.result;
    return result;
  }

  public async downloadFileContent(fileId: string): Promise<string> {
    const authToken = this.gapi.client.getToken();
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
    const authToken = this.gapi.client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(
      formBoundary,
      fileName,
      fileContent,
      fileContentType
    );
    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    await fetch(url, {
      method: "POST",
      headers: new Headers({
        Authorization: authToken.token_type + " " + authToken.access_token,
        Accept: "application/json",
        "Content-Type": "multipart/related; boundary=" + formBoundary,
        "Content-Length": requestBody.length
      } as any),
      body: requestBody
    });
  }

  public async updateFile(
    fileId: string,
    fileName: string,
    fileContent: string,
    fileContentType: string
  ): Promise<void> {
    const authToken = this.gapi.client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(
      formBoundary,
      fileName,
      fileContent,
      fileContentType
    );
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    await fetch(url, {
      method: "PATCH",
      headers: new Headers({
        Authorization: authToken.token_type + " " + authToken.access_token,
        Accept: "application/json",
        "Content-Type": "multipart/related; boundary=" + formBoundary,
        "Content-Length": requestBody.length
      } as any),
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
