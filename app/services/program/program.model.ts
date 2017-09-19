import { ProgramStorageType } from "app/services/program/program-management.service";

export type lang = "logo";

export interface ProgramModel {
  id: string;
  storageType?: ProgramStorageType;
  name: string;
  lang: lang;
  code: string;
  screenshot: string;
  dateCreated: Date;
  dateLastEdited: Date;
  hasTempLocalModifications: boolean;
}
