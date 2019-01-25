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
  gist = "gist",
  playground = "playground"
}
