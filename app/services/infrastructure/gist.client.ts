import * as fetch from "isomorphic-fetch";
import { DictionaryLike } from "app/utils/syntax";

const gistApiBaseUrl = "https://api.github.com/";

interface SingleGistResponse {
  id: string;
  description: string;
  files: DictionaryLike<GistFileDescriptor>;
  created_at: string;
  updated_at: string;
}

interface GistFileDescriptor {
  filename: string;
  size: number;
  truncated: boolean;
  content: string;
}

export class GistClient {
  constructor() {
    /** */
  }

  async get(id: string): Promise<{ name: string; text: string }> {
    const relativeUrl = `gists/${id}`;
    const response = await fetch(gistApiBaseUrl + relativeUrl, {
      method: "get",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8"
      })
    });
    if (response.ok) {
      const result = (await response.json()) as SingleGistResponse;
      if (result.id != id) {
        throw new Error("Gist API returned wrong id for request");
      }
      const fileNames = Object.keys(result.files);
      if (fileNames.length != 1) {
        throw new Error("Gist API should return only one file");
      }
      const file = result.files[fileNames[0]];
      if (file.truncated) {
        throw new Error("Requested resource is too big");
      }
      const data = {
        text: file.content,
        name: file.filename
      };
      return data;
    } else {
      console.error(await response.text());
    }
    throw new Error("Sorry, there was an error!");
  }

  async post(name: string, text: string): Promise<string> {
    const payload = {
      description: name,
      public: true,
      files: {} as any
    };
    payload.files[name] = {
      content: text
    };
    const response = await fetch(gistApiBaseUrl + "gists", {
      method: "post",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8"
      }),
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const result = (await response.json()) as SingleGistResponse;
      return result.id;
    } else {
      console.error(await response.text());
    }

    throw new Error("Something went wrong");
  }
}
