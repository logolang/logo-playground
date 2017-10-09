import { RandomHelper } from "app/utils/random-helper";

export interface IGoogleFileInfo {
  name: string;
  id: string;
  md5Checksum: string;
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

  public async listFiles(): Promise<IGoogleFilesListResponse> {
    const response = await this.gapi.client.drive.files.list({
      fields: "nextPageToken, files(id, name, md5Checksum)",
      pageSize: 100
    });
    const result: IGoogleFilesListResponse = response.result;
    return result;
  }

  public async downloadFileContent(fileId: string): Promise<string> {
    const authToken = this.gapi.client.getToken();
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authToken.token_type + " " + authToken.access_token
      }
    });
    if (result.ok) {
      return await result.text();
    }
    throw new Error("Google drive read error");
  }

  public async uploadNewFile(fileName: string, fileContent: string): Promise<void> {
    const authToken = this.gapi.client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(formBoundary, fileName, fileContent);
    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authToken.token_type + " " + authToken.access_token,
        Accept: "application/json",
        "Content-Type": "multipart/related; boundary=" + formBoundary,
        "Content-Length": requestBody.length
      },
      body: requestBody
    });
  }

  public async updateFile(fileId: string, fileName: string, fileContent: string): Promise<void> {
    const authToken = this.gapi.client.getToken();
    const formBoundary = "__" + RandomHelper.getRandomObjectId(32) + "__";
    const requestBody = this.createFileUploadBody(formBoundary, fileName, fileContent);
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: authToken.token_type + " " + authToken.access_token,
        Accept: "application/json",
        "Content-Type": "multipart/related; boundary=" + formBoundary,
        "Content-Length": requestBody.length
      },
      body: requestBody
    });
  }

  private createFileUploadBody(formBoundary: string, fileName: string, fileContent: string): string {
    let formData = "";
    formData += "--" + formBoundary + "\n";
    formData += "Content-Type: application/json; charset=UTF-8\n\n";
    formData += JSON.stringify({ name: fileName });
    formData += "\n--" + formBoundary + "\n";
    formData += "Content-Type: text/plain; charset=UTF-8\n\n";
    formData += fileContent;
    formData += "\n\n--" + formBoundary + "--\n";
    return formData;
  }
}
