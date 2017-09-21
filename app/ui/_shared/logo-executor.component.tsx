import * as React from "react";
import * as jquery from "jquery";
import { Subscription, Subject, Observable } from "rxjs";
import "app/../lib/logojs/logo.js";
const polyfills = require("app/../lib/logojs/polyfills.logo.txt") as any;

import { LogoOutputGraphics } from "./logo-output-graphics";
import { LogoOutputConsole } from "./logo-output-console";

import "./logo-executor.component.scss";

export interface ICreateScreenshotCommand {
  isSmall: boolean;
  whenReady: (data: string) => void;
}

interface IComponentState {}

export interface ILogoExecutorComponentProps {
  height: number;
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

    this.state = {};
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.graphics = new LogoOutputGraphics(
      "#sandbox",
      "#turtle",
      "#overlay",
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
        <canvas id="sandbox" height={this.props.height} />
        <canvas id="turtle" height={this.props.height} />
        <div id="overlay" />
        <div id="errorMessagesContainer" className="alert alert-danger" role="alert" style={{ display: "none" }} />
      </div>
    );
  }

  private showError = (error: string) => {
    jquery("#errorMessagesContainer").text(error);
    jquery("#errorMessagesContainer").show();
  };

  private clearError = () => {
    jquery("#errorMessagesContainer").text("");
    jquery("#errorMessagesContainer").hide();
  };

  private execute = async (code: string): Promise<void> => {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.props.onIsRunningChanged.next(this.isRunning);
    const lightThemeInit = `setbg 7 setpencolor 0 cs`;
    const darkThemeInit = `setbg 0 setpencolor 7 cs`;
    const initCode = this.props.isDarkTheme ? darkThemeInit : lightThemeInit;

    this.resizeCanvas();

    const LogoInterpreter: any = (window as any)["LogoInterpreter"];

    this.logo = new LogoInterpreter(this.graphics.initTurtle(), new LogoOutputConsole("#overlay"), function(
      name: any,
      def: any
    ) {
      /*empty*/
    });

    this.clearError();
    try {
      await this.logo.run(polyfills + "\r\n" + initCode + "\r\n" + code);
      this.isRunning = false;
      this.props.onIsRunningChanged.next(this.isRunning);
    } catch (ex) {
      console.error("error", ex);
      this.showError(ex.message);
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
      const container = jquery(".logo-executor-container");
      const width = container.width();
      const height = container.height();
      this.graphics.resizeCanvas(width || 400, height || 300);
    }
  }
}
