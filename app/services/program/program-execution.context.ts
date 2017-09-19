import { Subject, BehaviorSubject } from "rxjs/Rx";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady: (data: string) => void;
}

export class ProgramExecutionContext {
  public runCommands = new Subject<string>();
  public stopCommands = new Subject<void>();
  public focusCommands = new Subject<void>();
  public onIsRunningChanged = new BehaviorSubject<boolean>(false);
  public makeScreenshotCommands = new Subject<ICreateScreenshotCommand>();
  private hasProgramBeenExecutedOnce = false;

  constructor() {
    /**/
  }

  get isRunning() {
    return this.onIsRunningChanged.getValue();
  }

  executeProgram = (code: string) => {
    this.hasProgramBeenExecutedOnce = true;
    this.runCommands.next(code);
    this.focusCommands.next();
  };

  stopProgram = () => {
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
