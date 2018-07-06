import { Subject, BehaviorSubject } from "rxjs";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady(data: string): void;
}

export class ProgramExecutionContext {
  public runCommands = new Subject<string>();
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
    this.runCommands.next("");
  };

  getScreenshot = async (isSmall: boolean): Promise<string> => {
    if (!this.hasProgramBeenExecutedOnce) {
      return "";
    }
    return new Promise<string>(resolve => {
      this.makeScreenshotCommands.next({
        isSmall: isSmall,
        whenReady: (data: string) => {
          resolve(data);
        }
      });
    });
  };
}
