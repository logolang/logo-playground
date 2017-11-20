import * as fetch from "isomorphic-fetch";
import { handleAsyncError } from "app/utils/async-helpers";
import { injectable } from "app/di";

export abstract class ImageUploadService {
  abstract doUpload(imageBase64: string): Promise<string>;
}

@injectable()
export class ImageUploadImgurService implements ImageUploadService {
  constructor(private clientId: string, private serviceUrl: string) {}

  async doUpload(imageBase64: string): Promise<string> {
    const imgData = imageBase64.substr("data:image/png;base64,".length);

    const auth = `Client-ID ${this.clientId}`;
    const serviceUrl = this.serviceUrl || "https://api.imgur.com/3/image";
    const form = new URLSearchParams();
    form.append("image", imgData);
    form.append("type", "base64");
    const result = await fetch(serviceUrl, {
      method: "post",
      headers: new Headers({
        Authorization: auth,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }),
      body: form
    });

    if (result.ok) {
      const resultData = await result.json();
      const link = resultData.data.link;
      return link;
    } else {
      throw handleAsyncError(result);
    }
  }
}
