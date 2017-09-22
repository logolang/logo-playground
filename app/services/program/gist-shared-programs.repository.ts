import * as fetch from "isomorphic-fetch";
import { injectable, inject } from "app/di";
import { DictionaryLike } from "app/utils/syntax-helpers";
import { stay } from "app/utils/async-helpers";
import { RandomHelper } from "app/utils/random-helper";
import { ProgramModel } from "app/services/program/program.model";

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

@injectable()
export class GistSharedProgramsRepository {
  constructor() {
    /** */
  }

  async get(id: string): Promise<ProgramModel> {
    const idvesion = id.split(":");
    const id_part = idvesion.length == 2 ? idvesion[0] : id;
    const version_part = idvesion.length == 2 ? idvesion[1] : "";
    const relativeUrl = version_part ? `gists/${id_part}/${version_part}` : `gists/${id_part}`;
    const response = await fetch(gistApiBaseUrl + relativeUrl, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8"
      }
    });
    if (response.ok) {
      const result = (await response.json()) as SingleGistResponse;
      if (result.id != id_part) {
        throw new Error("Gist api returned wrong id for request");
      }
      for (const fileName in result.files) {
        const file = result.files[fileName];
        if (file.truncated) {
          throw new Error("Requested resource is too big");
        }
        const program: ProgramModel = {
          id: id,
          code: file.content,
          dateCreated: new Date(result.created_at),
          dateLastEdited: new Date(result.updated_at),
          lang: "logo",
          name: file.filename,
          screenshot: "",
          hasTempLocalModifications: false
        };
        return program;
      }
    } else {
      console.error(await response.text());
    }
    throw new Error("Sorry, there was an error!");
  }

  async post(programName: string, screenshot: string, program: ProgramModel): Promise<string> {
    const payload = {
      description: programName,
      public: true,
      files: {} as any
    };
    payload.files[programName] = {
      content: program.code
    };
    const response = await fetch(gistApiBaseUrl + "gists", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const result = (await response.json()) as SingleGistResponse;
      const id = result.id;
      return "http://localhost:8085/#/code/gist/" + id;
    } else {
      console.error(await response.text());
    }

    throw new Error("Something went wrong");
  }
}
