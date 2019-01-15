import { RandomHelper } from "app/utils/random-helper";

import { injectable, inject } from "app/di";
import { AppConfig } from "app/services/config/app-config";
import { CurrentUserService } from "app/services/login/current-user.service";
import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { GoogleDriveClient, IGoogleFileInfo } from "app/services/infrastructure/google-drive.client";
import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";
import { PersonalGalleryRemoteRepository } from "./personal-gallery-remote.repository";

const storageFileContentType = "text/html; charset=UTF-8";

interface IStoredData {
  fileId: string;
  fileHash: string;
  programs: ProgramModel[];
}

@injectable()
export class PersonalGalleryGoogleDriveRepository implements PersonalGalleryRemoteRepository {
  private googleDriveClient: GoogleDriveClient;
  private serializationService = new ProgramsHtmlSerializerService();
  private cachedData: IStoredData | undefined = undefined;

  constructor(
    @inject(CurrentUserService) private currentUser: CurrentUserService,
    @inject(AppConfig) private appConfig: AppConfig
  ) {
    this.googleDriveClient = new GoogleDriveClient();
  }

  async getAll(): Promise<ProgramModel[] | undefined> {
    const data = await this.getStoredData();
    if (data) {
      return data.programs;
    }
    return undefined;
  }

  async get(id: string): Promise<ProgramModel> {
    const existingPrograms = (await this.getAll()) || [];
    const pr = existingPrograms.find(p => p.id === id);
    if (pr) {
      // return clone of program object - so original will be intact in memory if updates happen
      return { ...pr };
    }
    throw new Error("Program is not found");
  }

  async add(programs: ProgramModel[]): Promise<void> {
    const storedData = await this.getStoredData();
    const programsToStore = storedData ? [...storedData.programs] : [];
    for (const program of programs) {
      if (!program.id) {
        program.id = RandomHelper.getRandomObjectId(32);
      }
      program.dateCreated = new Date();
      program.dateLastEdited = new Date();
      programsToStore.push(program);
    }
    await this.storeData(programsToStore, storedData ? storedData.fileId : undefined);
  }

  async save(programToSave: ProgramModel): Promise<void> {
    const storedData = await this.getStoredData();
    if (!storedData) {
      throw new Error("Google storage is empty");
    }
    const program = storedData.programs.find(p => p.id === programToSave.id);
    if (!program) {
      throw new Error("Program is not found in google storage");
    }
    program.dateLastEdited = new Date();
    program.code = programToSave.code;
    program.screenshot = programToSave.screenshot;

    await this.storeData(storedData.programs, storedData.fileId);
  }

  async remove(id: string): Promise<void> {
    const storedData = await this.getStoredData();
    if (!storedData) {
      throw new Error("Google storage is empty");
    }
    const programsToStore = storedData.programs.filter(p => p.id !== id);

    await this.storeData(programsToStore, storedData.fileId);
  }

  private async storeData(programsToStore: ProgramModel[], fileId: string | undefined) {
    const serializedData = await this.serializationService.serialize(
      programsToStore,
      this.currentUser.getLoginStatus().userInfo.attributes.name,
      this.currentUser.getLoginStatus().userInfo.attributes.imageUrl
    );
    if (fileId) {
      await this.googleDriveClient.updateFile(
        fileId,
        this.appConfig.services.googleDriveGalleryFilename,
        serializedData,
        storageFileContentType
      );
    } else {
      await this.googleDriveClient.uploadNewFile(
        this.appConfig.services.googleDriveGalleryFilename,
        serializedData,
        storageFileContentType
      );
    }
  }

  private async getStoredData(): Promise<IStoredData | undefined> {
    const storageFileInfo = await this.getStorageFileInfo();
    if (!storageFileInfo) {
      return undefined;
    }

    if (this.cachedData && this.cachedData.fileHash === storageFileInfo.md5Checksum) {
      return this.cachedData;
    }

    const storedContent = await this.googleDriveClient.downloadFileContent(storageFileInfo.id);
    const programs = this.serializationService.parse(storedContent);
    const data = {
      fileId: storageFileInfo.id,
      fileHash: storageFileInfo.md5Checksum,
      programs
    };
    for (const p of programs) {
      p.storageType = ProgramStorageType.gallery;
    }
    this.cachedData = data;
    return data;
  }

  private async getStorageFileInfo(): Promise<IGoogleFileInfo | undefined> {
    const storageFileName = this.appConfig.services.googleDriveGalleryFilename;
    const files = await this.googleDriveClient.listFiles("name = '" + storageFileName + "' and trashed = false");
    const storageFile = files.files.find(f => f.name === storageFileName && !!f.md5Checksum && !f.trashed);
    if (!storageFile) {
      console.log("storage file is not found");
      return undefined;
    }
    return storageFile;
  }
}
