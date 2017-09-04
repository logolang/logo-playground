import { Subject, BehaviorSubject } from "rxjs/Rx";
import * as keymaster from "keymaster";

import { ProgramStorageType } from "app/services/program/program-management.service";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady: (data: string) => void;
}

export class ProgramExecutionService {
  private _code = "";
  public get code(): string {
    return this._code;
  }
  public codeChangesStream = new Subject<{ code: string; source: "internal" | "external" }>();
  public programName: string;
  public programId: string;
  public runCommands = new Subject<string>();
  public stopCommands = new Subject<void>();
  public focusCommands = new Subject<void>();
  public onIsRunningChanged = new BehaviorSubject<boolean>(false);
  public makeScreenshotCommands = new Subject<ICreateScreenshotCommand>();
  private hasProgramBeenExecutedOnce = false;

  constructor() {
    /**/
  }

  setProgram = (programId: string, programName: string, code: string) => {
    this.programId = programId;
    this.programName = programName;
    this.updateCode(code, "internal");
  };

  updateCode = (newCode: string, source: "internal" | "external") => {
    this._code = newCode;
    this.codeChangesStream.next({ code: newCode, source: source });
  };

  get isRunning() {
    return this.onIsRunningChanged.getValue();
  }

  initHotkeys = () => {
    keymaster("f8, f9", () => {
      this.runCurrentProgram();
      return false;
    });
  };

  disposeHotkeys = () => {
    keymaster.unbind("f8, f9");
  };

  runCurrentProgram = () => {
    this.hasProgramBeenExecutedOnce = true;
    this.runCommands.next(this.code);
    this.focusCommands.next();
  };

  stopCurrentProgram = () => {
    this.stopCommands.next();
    this.focusCommands.next();
  };

  getScreenshot = async (small: boolean): Promise<string> => {
    if (!this.hasProgramBeenExecutedOnce) {
      return "";
    }
    return new Promise<string>(resolve => {
      this.makeScreenshotCommands.next({
        isSmall: small,
        whenReady: (data: string) => {
          resolve(data);
        }
      });
    });
  };
}
