export interface ProgramModel {
  id: string;
  storageType: ProgramStorageType;
  name: string;
  code: string;
  screenshot: string;
  dateCreated: Date;
  dateLastEdited: Date;
}

export enum ProgramStorageType {
  samples = "samples",
  gallery = "gallery",
  shared = "shared",
  playground = "playground"
}

export function createNewProgram(options: {
  storageType: ProgramStorageType;
  name?: string;
  code?: string;
  screenshot?: string;
}) {
  const program: ProgramModel = {
    id: "",
    storageType: options.storageType,
    name: options.name || "",
    code: options.code || "",
    screenshot: options.screenshot || "",
    dateCreated: new Date(),
    dateLastEdited: new Date()
  };
  return program;
}
