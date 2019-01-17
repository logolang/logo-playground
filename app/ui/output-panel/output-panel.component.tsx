import * as React from "react";
import { Subscription } from "rxjs";

import { ProgramExecutionContext, ICreateScreenshotCommand } from "app/services/program/program-execution.context";
import { LogoExecutorComponent } from "app/ui/_generic/logo-executor/logo-executor.component";

export interface IComponentProps {
  executionContext: ProgramExecutionContext;
  isDarkTheme: boolean;
  turtleImage?: HTMLImageElement;
  turtleSize?: number;
}

interface IComponentState {}

export class OutputPanelComponent extends React.Component<IComponentProps, IComponentState> {
  private logoExecutorRef: LogoExecutorComponent | undefined;
  private makeScreenshotSubscription: Subscription;

  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.makeScreenshotSubscription = this.props.executionContext.makeScreenshotCommands.subscribe(this.makeScreenshot);
  }

  componentWillUnmount() {
    this.makeScreenshotSubscription.unsubscribe();
  }

  onIsRunningChange = (isRunning: boolean) => {
    this.props.executionContext.onIsRunningChange.next(isRunning);
  };

  makeScreenshot = (command: ICreateScreenshotCommand) => {
    if (this.logoExecutorRef) {
      const data = this.logoExecutorRef.createScreenshotBase64(command.isSmall);
      command.whenReady(data);
    }
  };

  render(): JSX.Element {
    return (
      <LogoExecutorComponent
        ref={x => (this.logoExecutorRef = x || undefined)}
        runCommands={this.props.executionContext.runCommands}
        onIsRunningChange={this.onIsRunningChange}
        isDarkTheme={this.props.isDarkTheme}
        turtleImage={this.props.turtleImage}
        turtleSize={this.props.turtleSize}
      />
    );
  }
}
