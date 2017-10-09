import { RandomHelper } from "app/utils/random-helper";
import { injectable, inject } from "app/di";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { IUserLibraryRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { GoogleDriveClient, IGoogleFileInfo } from "app/services/infrastructure/google-drive.client";

const confFileName = "personal-logo-programs-library.json";

interface IConfigData {
  configFileId: string;
  configFileHash: string;
  programs: ProgramModel[];
}

@injectable()
export class ProgramsGoogleDriveRepository implements IUserLibraryRepository {
  private googleDriveClient = new GoogleDriveClient();
  constructor(@inject(ICurrentUserService) private currentUser: ICurrentUserService) {
    this.googleDriveClient = new GoogleDriveClient();
  }

  async getAll(): Promise<ProgramModel[]> {
    const data = await this.getConfigData();
    return data.programs;
  }

  async get(id: string): Promise<ProgramModel> {
    const existingPrograms = await this.getAll();
    const pr = existingPrograms.find(p => p.id === id);
    if (pr) {
      return pr;
    }
    throw new Error("Program is not found");
  }

  async add(program: ProgramModel): Promise<ProgramModel> {
    program.id = RandomHelper.getRandomObjectId(32);
    program.dateCreated = new Date();
    program.dateLastEdited = new Date();

    const configData = await this.getConfigData();
    const programsToStore = [...configData.programs];
    programsToStore.push(program);

    const serializedData = JSON.stringify(programsToStore, null, 2);
    if (configData.configFileId) {
      await this.googleDriveClient.updateFile(configData.configFileId, confFileName, serializedData);
    } else {
      await this.googleDriveClient.uploadNewFile(confFileName, serializedData);
    }

    return program;
  }

  async remove(id: string): Promise<void> {
    const configData = await this.getConfigData();
    const programsToStore = configData.programs.filter(p => p.id !== id);
    const serializedData = JSON.stringify(programsToStore, null, 2);
    if (configData.configFileId) {
      await this.googleDriveClient.updateFile(configData.configFileId, confFileName, serializedData);
    } else {
      await this.googleDriveClient.uploadNewFile(confFileName, serializedData);
    }
  }

  private async getConfigData(): Promise<IConfigData> {
    const configFileInfo = await this.getConfigFileInfo();
    if (!configFileInfo) {
      return {
        configFileId: "",
        configFileHash: "",
        programs: []
      };
    }
    const configSerialized = await this.googleDriveClient.downloadFileContent(configFileInfo.id);
    console.log("Got config", configSerialized);

    const programs: ProgramModel[] = [];
    try {
      const programsRaw = JSON.parse(configSerialized);
      for (const p of programsRaw) {
        programs.push(ProgramModelConverter.fromJson(p));
      }
    } catch (ex) {
      console.error(ex);
    }
    return {
      configFileId: configFileInfo.id,
      configFileHash: configFileInfo.md5Checksum,
      programs: programs
    };
  }

  private async getConfigFileInfo(): Promise<IGoogleFileInfo | undefined> {
    const files = await this.googleDriveClient.listFiles();
    const configFile = files.files.find(f => f.name === confFileName);
    if (!configFile) {
      console.log("configFile is not found");
      return undefined;
    }
    return configFile;
  }
}
