import { ProgramModel } from "app/services/program/program.model";
import { injectable, inject } from "app/di";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { TutorialsContentService, ITutorialsContentService } from "app/services/tutorials/tutorials-content-service";
import { ProgramStorageType } from "app/services/program/program-management.service";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

export abstract class ITutorialsSamplesRepository {
  abstract get(id: string): Promise<ProgramModel>;
}

@injectable()
export class TutorialsCodeRepository implements ITutorialsSamplesRepository {
  constructor(
    @inject(ICurrentUserService) private currentUser: ICurrentUserService,
    @inject(ITutorialsContentService) private tutorialsContentService: TutorialsContentService
  ) {}

  async get(id: string): Promise<ProgramModel> {
    // id is expected to be in TutorialId:StepId format
    const parts = id.split(":");
    if (parts.length != 2) {
      throw new Error("Wrong format for tutorial code ID request");
    }
    const tutorialName = parts[0];
    const stepId = parts[1];
    const tutorialInfo = await this.tutorialsContentService.getStep(tutorialName, stepId);
    const program = ProgramModelConverter.createNewProgram(
      ProgramStorageType.tutorial,
      "tutorial-program-name",
      tutorialInfo.initialCode,
      ""
    );
    program.id = id;
    return program;
  }
}
