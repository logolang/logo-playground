import { ProgramStorageType } from "app/services/program/program-management.service";
import { ProgramModel } from "app/services/program/program.model";

export class ProgramModelConverter {
  public static createNewProgram(
    storageType: ProgramStorageType | undefined,
    name: string,
    code: string,
    screenshot: string
  ) {
    const program: ProgramModel = {
      id: "",
      storageType: storageType,
      name: name,
      lang: "logo",
      code: code,
      screenshot: screenshot,
      dateCreated: new Date(),
      dateLastEdited: new Date(),
      hasTempLocalModifications: false
    };
    return program;
  }

  public static toJson(program: ProgramModel): string {
    return JSON.stringify(program);
  }

  public static fromJson(parsedJson: object): ProgramModel {
    const obj = parsedJson as any;
    // check imported program object
    if (!obj.code) {
      obj.code = "";
    }
    if (!obj.dateCreated) {
      throw new Error(`Wrong program object: field 'dateCreated' is not defined`);
    }
    if (!obj.dateLastEdited) {
      throw new Error(`Wrong program object: field 'dateLastEdited' is not defined`);
    }
    if (!obj.id) {
      throw new Error(`Wrong program object: field 'id' is not defined`);
    }
    if (!obj.lang) {
      throw new Error(`Wrong program object: field 'lang' is not defined`);
    }
    if (!obj.name) {
      throw new Error(`Wrong program object: field 'name' is not defined`);
    }

    const program: ProgramModel = {
      id: obj.id,
      storageType: undefined,
      name: obj.name,
      lang: obj.lang,
      code: obj.code,
      screenshot: obj.screenshot || "",
      dateCreated: new Date(obj.dateCreated),
      dateLastEdited: new Date(obj.dateLastEdited),
      hasTempLocalModifications: false
    };

    return program;
  }
}
