import * as React from "react";
import { Subscription, Observable } from "rxjs";
import "app/../lib/logojs/logo.js";
const polyfills = require("app/../lib/logojs/polyfills.logo.txt");

import { LogoOutputGraphics } from "./logo-output-graphics";
import { LogoOutputConsole } from "./logo-output-console";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

import "./logo-executor.component.less";

interface IComponentState {
  errorMessage: string;
}

export interface ILogoExecutorComponentProps {
  runCommands: Observable<string>;
  onIsRunningChange?(isRunning: boolean): void;
  isDarkTheme: boolean;
  turtleImage?: HTMLImageElement;
  turtleSize?: number;
}

export class LogoExecutorComponent extends React.Component<ILogoExecutorComponentProps, IComponentState> {
  runCommandsSubscription: Subscription;
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
    this.graphics = new LogoOutputGraphics("#sandbox", "#turtle");
    this.runCommandsSubscription = this.props.runCommands.subscribe(this.execute);
  }

  componentWillUnmount() {
    this.abort();
    if (this.runCommandsSubscription) {
      this.runCommandsSubscription.unsubscribe();
    }
  }

  /**
   * Creates base64 encoded screenshot of graphic canvas
   */
  public createScreenshotBase64 = (isSmall: boolean): string => {
    if (this.graphics) {
      const base64 = this.graphics.createScreenshot(isSmall);
      return base64;
    }
    return "";
  };

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
    if (!code) {
      this.abort();
      return;
    }
    if (this.isRunning) {
      return;
    }

    this.setState({
      errorMessage: ""
    });

    this.isRunning = true;
    this.props.onIsRunningChange && this.props.onIsRunningChange(this.isRunning);
    const lightThemeInit = `setbg 7 setpencolor 0 cs`;
    const darkThemeInit = `setbg 0 setpencolor 7 cs`;
    const initCode = this.props.isDarkTheme ? darkThemeInit : lightThemeInit;

    this.resizeCanvas();

    const LogoInterpreter: any = (window as any)["LogoInterpreter"];

    this.logo = new LogoInterpreter(
      this.graphics.initTurtle(this.props.turtleImage, this.props.turtleSize),
      new LogoOutputConsole("#console-output")
    );

    // Replace all non-breaking spaces to normal ones because jsLogo does not understand them
    // This nbsp might occur when typing code on mobile devices
    code = code.replace(/\u00A0/g, " ");

    try {
      await this.logo.run(polyfills + "\r\n" + initCode + "\r\n" + code);
      this.isRunning = false;
      this.props.onIsRunningChange && this.props.onIsRunningChange(this.isRunning);
    } catch (ex) {
      console.error("error", ex);

      this.setState({
        errorMessage: ex.message || ex.toString()
      });

      this.isRunning = false;
      this.props.onIsRunningChange && this.props.onIsRunningChange(this.isRunning);
    }
  };

  private abort = (): void => {
    if (this.logo) {
      this.logo.bye();
    }
  };

  private resizeCanvas() {
    if (!this.graphics) {
      return;
    }
    const container = document.querySelector(".logo-executor-container");
    if (!container) {
      return;
    }
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
      this.graphics.resizeCanvas(currentElement.clientWidth || 400, currentElement.clientHeight || 300);
    }
  }
}
