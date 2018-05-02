import { ProgramStorageType } from "app/services/program/program-management.service";

export interface ProgramModel {
  id: string;
  storageType?: ProgramStorageType;
  name: string;
  code: string;
  screenshot: string;
  dateCreated: Date;
  dateLastEdited: Date;
  hasTempLocalModifications: boolean;
}
