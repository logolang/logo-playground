import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady: (data: string) => void;
}

export class ProgramExecutionContext {
  public runCommands = new Subject<string>();
  public stopCommands = new Subject<void>();
  public onIsRunningChange = new BehaviorSubject<boolean>(false);
  public makeScreenshotCommands = new Subject<ICreateScreenshotCommand>();
  private hasProgramBeenExecutedOnce = false;

  constructor() {
    /**/
  }

  get isRunning() {
    return this.onIsRunningChange.getValue();
  }

  executeProgram = (code: string) => {
    this.hasProgramBeenExecutedOnce = true;
    this.runCommands.next(code);
  };

  stopProgram = () => {
    this.stopCommands.next();
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
