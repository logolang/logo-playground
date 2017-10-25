import { RandomHelper } from "app/utils/random-helper";
import { injectable, inject } from "app/di";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { IUserLibraryRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { GoogleDriveClient, IGoogleFileInfo } from "app/services/infrastructure/google-drive.client";
import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";

const storageFileName = "logo-personal-library.html";
const storageFileContentType = "text/html; charset=UTF-8";

interface IStoredData {
  fileId: string;
  fileHash: string;
  content: string;
}

@injectable()
export class ProgramsGoogleDriveRepository implements IUserLibraryRepository {
  private googleDriveClient = new GoogleDriveClient();
  private serializationService = new ProgramsHtmlSerializerService();

  constructor(@inject(ICurrentUserService) private currentUser: ICurrentUserService) {
    this.googleDriveClient = new GoogleDriveClient();
  }

  async getAll(): Promise<ProgramModel[]> {
    const data = await this.getStoredData();
    const programs = this.serializationService.parse(data.content);
    return programs;
  }

  async get(id: string): Promise<ProgramModel> {
    const existingPrograms = await this.getAll();
    const pr = existingPrograms.find(p => p.id === id);
    if (pr) {
      return pr;
    }
    throw new Error("Program is not found");
  }

  async add(programs: ProgramModel[]): Promise<void> {
    const storedData = await this.getStoredData();
    const existingPrograms = this.serializationService.parse(storedData.content);
    const programsToStore = [...existingPrograms];
    for (const program of programs) {
      if (!program.id) {
        program.id = RandomHelper.getRandomObjectId(32);
      }
      program.dateCreated = new Date();
      program.dateLastEdited = new Date();
      programsToStore.push(program);
    }

    const serializedData = this.serializationService.serialize(programsToStore);
    if (storedData.fileId) {
      await this.googleDriveClient.updateFile(
        storedData.fileId,
        storageFileName,
        serializedData,
        storageFileContentType
      );
    } else {
      await this.googleDriveClient.uploadNewFile(storageFileName, serializedData, storageFileContentType);
    }
  }

  async remove(id: string): Promise<void> {
    const storedData = await this.getStoredData();
    const programs = this.serializationService.parse(storedData.content);
    const programsToStore = programs.filter(p => p.id !== id);
    const serializedData = this.serializationService.serialize(programsToStore);
    if (storedData.fileId) {
      await this.googleDriveClient.updateFile(
        storedData.fileId,
        storageFileName,
        serializedData,
        storageFileContentType
      );
    } else {
      await this.googleDriveClient.uploadNewFile(storageFileName, serializedData, storageFileContentType);
    }
  }

  private async getStoredData(): Promise<IStoredData> {
    const storageFileInfo = await this.getStorageFileInfo();
    if (!storageFileInfo) {
      return {
        fileId: "",
        fileHash: "",
        content: ""
      };
    }
    const storedContent = await this.googleDriveClient.downloadFileContent(storageFileInfo.id);
    return {
      fileId: storageFileInfo.id,
      fileHash: storageFileInfo.md5Checksum,
      content: storedContent
    };
  }

  private async getStorageFileInfo(): Promise<IGoogleFileInfo | undefined> {
    const files = await this.googleDriveClient.listFiles("name = '" + storageFileName + "' and trashed = false");
    const storageFile = files.files.find(f => f.name === storageFileName && !!f.md5Checksum && !f.trashed);
    if (!storageFile) {
      console.log("storage file is not found");
      return undefined;
    }
    return storageFile;
  }
}
