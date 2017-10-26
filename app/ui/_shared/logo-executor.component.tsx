import * as React from "react";
import { Subscription, Subject, Observable } from "rxjs";
import "app/../lib/logojs/logo.js";
const polyfills = require("app/../lib/logojs/polyfills.logo.txt") as any;

import { LogoOutputGraphics } from "./logo-output-graphics";
import { LogoOutputConsole } from "./logo-output-console";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

import "./logo-executor.component.scss";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady: (data: string) => void;
}

interface IComponentState {
  errorMessage: string;
}

export interface ILogoExecutorComponentProps {
  runCommands: Observable<string>;
  stopCommands: Observable<void>;
  makeScreenshotCommands?: Observable<ICreateScreenshotCommand>;
  onIsRunningChanged: Subject<boolean>;
  isDarkTheme: boolean;
  customTurtleImage?: HTMLImageElement;
  customTurtleSize?: number;
}

export class LogoExecutorComponent extends React.Component<ILogoExecutorComponentProps, IComponentState> {
  runSubscription: Subscription;
  stopSubscription: Subscription;
  makeScreenshotSubscription: Subscription;
  private logo: any;
  private graphics: LogoOutputGraphics;
  private isRunning: boolean;

  constructor(props: ILogoExecutorComponentProps) {
    super(props);

    this.state = {
      errorMessage: ""
    };
  }

  componentDidMount() {
    this.graphics = new LogoOutputGraphics(
      "#sandbox",
      "#turtle",
      this.props.customTurtleImage,
      this.props.customTurtleSize
    );
    this.runSubscription = this.props.runCommands.subscribe(this.execute);
    this.stopSubscription = this.props.stopCommands.subscribe(this.abort);
    if (this.props.makeScreenshotCommands) {
      this.makeScreenshotSubscription = this.props.makeScreenshotCommands.subscribe(this.makeScreenShot);
    }
  }

  componentWillUnmount() {
    this.abort();
    if (this.runSubscription) {
      this.runSubscription.unsubscribe();
    }
    if (this.stopSubscription) {
      this.stopSubscription.unsubscribe();
    }
    if (this.makeScreenshotSubscription) {
      this.makeScreenshotSubscription.unsubscribe();
    }
  }

  render(): JSX.Element {
    return (
      <div className="logo-executor-container">
        <canvas id="sandbox" height="100" />
        <canvas id="turtle" height="100" />
        <div id="console-output" />
        <div id="error-messages-container">
          {this.state.errorMessage && <AlertMessageComponent message={this.state.errorMessage} />}
        </div>
      </div>
    );
  }

  private execute = async (code: string): Promise<void> => {
    if (this.isRunning) {
      return;
    }

    this.setState({
      errorMessage: ""
    });

    this.isRunning = true;
    this.props.onIsRunningChanged.next(this.isRunning);
    const lightThemeInit = `setbg 7 setpencolor 0 cs`;
    const darkThemeInit = `setbg 0 setpencolor 7 cs`;
    const initCode = this.props.isDarkTheme ? darkThemeInit : lightThemeInit;

    this.resizeCanvas();

    const LogoInterpreter: any = (window as any)["LogoInterpreter"];

    this.logo = new LogoInterpreter(this.graphics.initTurtle(), new LogoOutputConsole("#console-output"));

    try {
      await this.logo.run(polyfills + "\r\n" + initCode + "\r\n" + code);
      this.isRunning = false;
      this.props.onIsRunningChanged.next(this.isRunning);
    } catch (ex) {
      console.error("error", ex);

      this.setState({
        errorMessage: ex.message || ex.toString()
      });

      this.isRunning = false;
      this.props.onIsRunningChanged.next(this.isRunning);
    }
  };

  private abort = (): void => {
    if (this.logo) {
      this.logo.bye();
    }
  };

  private makeScreenShot = (params: ICreateScreenshotCommand) => {
    if (this.graphics) {
      const data = this.graphics.createScreenshot(params.isSmall);
      params.whenReady(data);
    }
  };

  private resizeCanvas() {
    if (this.graphics) {
      const container = document.querySelector(".logo-executor-container");
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
          this.graphics.resizeCanvas(width, height);
        } else {
          // go up in the DOM tree to find parent with size and use it
          let currentElement = container;
          while (currentElement && !(currentElement.clientWidth > 0 && currentElement.clientHeight > 0)) {
            currentElement = currentElement.parentElement as Element;
          }
          const width = currentElement.clientWidth;
          const height = currentElement.clientHeight;
          this.graphics.resizeCanvas(width || 400, height || 300);
        }
      }
    }
  }
}
