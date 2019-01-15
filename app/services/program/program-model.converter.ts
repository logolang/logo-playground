import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";

interface ProgramSaveObject {
  id: string;
  name: string;
  code: string;
  screenshot: string;
  dateCreated: Date;
  dateLastEdited: Date;
}

interface ProgramsSaveData {
  programs: ProgramSaveObject[];
}

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
      code: code,
      screenshot: screenshot,
      dateCreated: new Date(),
      dateLastEdited: new Date(),
      hasTempLocalModifications: false
    };
    return program;
  }

  public static toJson(programs: ProgramModel[]): string {
    const saveData: ProgramsSaveData = {
      programs: []
    };
    for (const program of programs) {
      const saveObject: ProgramSaveObject = {
        id: program.id,
        name: program.name,
        code: program.code,
        screenshot: program.screenshot || "",
        dateCreated: program.dateCreated,
        dateLastEdited: program.dateLastEdited
      };
      saveData.programs.push(saveObject);
    }
    return JSON.stringify(saveData);
  }

  public static fromJson(parsedJson: object): ProgramModel[] {
    const saveData = parsedJson as ProgramsSaveData;
    if (!saveData.programs) {
      throw new Error(`Wrong save data: programs field is not defined`);
    }
    const result: ProgramModel[] = [];
    for (const saveObject of saveData.programs) {
      // check imported program object
      if (!saveObject.code) {
        saveObject.code = "";
      }
      if (!saveObject.dateCreated) {
        throw new Error(`Wrong program object: field 'dateCreated' is not defined`);
      }
      if (!saveObject.dateLastEdited) {
        throw new Error(`Wrong program object: field 'dateLastEdited' is not defined`);
      }
      if (!saveObject.id) {
        throw new Error(`Wrong program object: field 'id' is not defined`);
      }
      if (!saveObject.name) {
        throw new Error(`Wrong program object: field 'name' is not defined`);
      }

      const program: ProgramModel = {
        id: saveObject.id,
        storageType: undefined,
        name: saveObject.name,
        code: saveObject.code,
        screenshot: saveObject.screenshot || "",
        dateCreated: new Date(saveObject.dateCreated),
        dateLastEdited: new Date(saveObject.dateLastEdited),
        hasTempLocalModifications: false
      };
      result.push(program);
    }

    return result;
  }
}
