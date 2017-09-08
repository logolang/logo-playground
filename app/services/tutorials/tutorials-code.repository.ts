import { ProgramModel } from "app/services/program/program.model";
import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { injectable, inject } from "app/di";
import { ICurrentUserService } from "app/services/login/current-user.service";
import {
  TutorialsContentService,
  ITutorialsContentService
} from "app/services/tutorials/tutorials-content-service";
import { ProgramStorageType } from "app/services/program/program-management.service";

@injectable()
export class TutorialsCodeRepository implements IProgramsRepository {
  constructor(
    @inject(ICurrentUserService) private currentUser: ICurrentUserService,
    @inject(ITutorialsContentService)
    private tutorialsContentService: TutorialsContentService
  ) {}

  async getAll(): Promise<ProgramModel[]> {
    throw new Error("not implemented");
  }

  async get(id: string): Promise<ProgramModel> {
    // id is expected to be in TutorialId:StepId format
    const parts = id.split(":");
    if (parts.length != 2) {
      throw new Error("Wrong format for tutorial code ID request");
    }
    const tutorialName = parts[0];
    const stepId = parts[1];
    const tutorialInfo = await this.tutorialsContentService.getStep(
      tutorialName,
      stepId
    );
    return new ProgramModel(
      id,
      ProgramStorageType.tutorial,
      "tutorial-program-name",
      "logo",
      tutorialInfo.initialCode,
      ""
    );
  }

  async add(program: ProgramModel): Promise<ProgramModel> {
    throw new Error("not implemented");
  }

  async update(program: ProgramModel): Promise<ProgramModel> {
    throw new Error("not implemented");
  }

  async remove(id: string): Promise<void> {
    throw new Error("not implemented");
  }
}
