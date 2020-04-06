import * as React from "react";
import "app/../lib/logojs/logo.js";
import polyfills from "app/../lib/logojs/polyfills.logo.txt";

import { LogoOutputGraphics } from "./logo-output-graphics";
import { LogoOutputConsole } from "./logo-output-console";
import { checkIsMobileDevice } from "utils/device";
import { AlertMessage } from "ui/_generic/alert-message";
import { processImports } from "./process-imports";

import "./logo-executor.less";

type LogoInterpreterInstance = {
  run(code: string): Promise<void>;
  bye(): void;
};
declare const LogoInterpreter: new (
  turtle: unknown,
  console: LogoOutputConsole
) => LogoInterpreterInstance;

interface State {
  errorMessage: string;
}

interface ImportsResolver {
  resolve(module: string): Promise<string>;
}

export interface Props {
  isRunning: boolean;
  code: string;
  isDarkTheme: boolean;
  turtleImageSrc: string;
  turtleSize: number;
  importsResolver?: ImportsResolver;
  onFinish(): void;
}

let idIncrement = 0;

export class LogoExecutor extends React.Component<Props, State> {
  private logo: LogoInterpreterInstance;
  private graphics: LogoOutputGraphics;
  private isRunning: boolean;
  private id = idIncrement++;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: ""
    };
  }

  async componentDidMount() {
    this.graphics = new LogoOutputGraphics("#sandbox" + this.id, "#turtle" + this.id);
    if (this.props.isRunning) {
      await this.execute();
    }
  }

  componentWillUnmount() {
    this.abort();
  }

  async componentDidUpdate() {
    if (this.isRunning != this.props.isRunning) {
      if (this.props.isRunning) {
        await this.execute();
      } else {
        this.abort();
      }
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
      <div id={`logo-executor-container${this.id}`} className="logo-executor-container">
        <canvas id={`sandbox${this.id}`} className="sandbox" height="100" />
        <img id={`turtle${this.id}`} className="turtle-img" src={this.props.turtleImageSrc} />
        <div id={`console-output${this.id}`} className="console-output" />
        <div id={`error-messages-container${this.id}`} className="error-messages-container">
          {this.state.errorMessage && <AlertMessage message={this.state.errorMessage} />}
        </div>
      </div>
    );
  }

  private execute = async (): Promise<void> => {
    this.isRunning = true;

    this.setState({
      errorMessage: ""
    });

    const alwaysInit = "cs cleartext ";
    const deviceInit = checkIsMobileDevice() ? "setscrunch 0.7 0.7 " : " ";
    const themeInit = this.props.isDarkTheme ? "setbg 0 setpencolor 7 " : "setbg 7 setpencolor 0 ";
    const initCode = alwaysInit + deviceInit + themeInit;

    this.resizeCanvas();

    this.logo = new LogoInterpreter(
      this.graphics.init(this.props.turtleSize),
      new LogoOutputConsole("#console-output" + this.id)
    );

    // Replace all non-breaking spaces to normal ones because jsLogo does not understand them
    // This symbols might occur when typing code on mobile devices
    let code = this.props.code.replace(/\u00A0/g, " ");

    // Resolve imports
    if (this.props.importsResolver) {
      code = await processImports(code, async module => {
        return this.props.importsResolver ? this.props.importsResolver.resolve(module) : "";
      });
    }

    try {
      await this.logo.run(polyfills + "\r\n" + initCode + "\r\n" + code);
    } catch (ex) {
      console.error("error", ex);
      this.setState({
        errorMessage: ex.message || ex.toString()
      });
    }
    this.props.onFinish();
    this.isRunning = false;
  };

  public abort = (): void => {
    if (this.logo && this.isRunning) {
      this.logo.bye();
    }
    this.isRunning = false;
  };

  private resizeCanvas() {
    if (!this.graphics) {
      return;
    }
    const container = document.getElementById("logo-executor-container" + this.id);
    if (!container) {
      return;
    }
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width > 0 && height > 0) {
      this.graphics.resizeCanvas(width, height);
    } else {
      // go up in the DOM tree to find parent with size and use it
      let currentElement: HTMLElement | null = container;
      while (
        currentElement &&
        !(currentElement.clientWidth > 0 && currentElement.clientHeight > 0)
      ) {
        currentElement = currentElement.parentElement;
      }
      if (currentElement) {
        this.graphics.resizeCanvas(
          currentElement.clientWidth || 400,
          currentElement.clientHeight || 300
        );
      }
    }
  }
}
