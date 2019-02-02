import * as React from "react";

import { $T } from "app/i18n-strings";
import { resolve } from "app/di";
import { ProgramStorageType } from "app/services/program/program.model";
import { EventsTrackingService, EventAction } from "app/services/env/events-tracking.service";
import { checkIsMobileDevice } from "app/utils/device";

import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { LogoExecutor } from "app/ui/_generic/logo-executor/logo-executor";
import { Loading } from "app/ui/_generic/loading";
import { CodeInput } from "app/ui/_generic/code-input/code-input";
import { CodeMenu } from "app/ui/code-menu/code-menu";
import {
  playgroundDefaultMobileLayout,
  playgroundDefaultLayout
} from "./playground-default-goldenlayout";

import "./playground.less";
import { MainMenuContainer } from "../main-menu.container";
import { UserSettings } from "app/types/user-settings";
import { getTurtleImage } from "../turtles/turtles";

interface Props {
  isLoading: boolean;
  storageType?: ProgramStorageType;
  programId?: string;
  code: string;
  programName: string;
  hasModifications: boolean;
  isRunning: boolean;
  userSettings: UserSettings;
  loadProgram(storageType?: ProgramStorageType, programId?: string): void;
  codeChanged(code: string): void;
  runProgram(): void;
  stopProgram(): void;
  deleteProgram(): void;
  saveAsProgram(newName: string, screenShot: string): void;
  saveProgram(screenShot: string): void;
  clearProgram(): void;
  revertChanges(): void;
}

interface State {
  resizeIncrement: number;
}

export class Playground extends React.Component<Props, State> {
  private eventsTracker = resolve(EventsTrackingService);
  private isMobileDevice = checkIsMobileDevice();
  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? playgroundDefaultMobileLayout : playgroundDefaultLayout
  );
  private layoutLocalStorageKey =
    "logo-playground-v1.0:playground-layout" + (this.isMobileDevice ? "-mobile" : "-desktop");
  private logoExecutorRef: LogoExecutor | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { resizeIncrement: 1 };
  }

  async componentDidMount() {
    this.eventsTracker.sendEvent(EventAction.openPlayground);
    this.props.loadProgram(this.props.storageType, this.props.programId);
  }

  async componentDidUpdate(oldProps: Props) {
    if (
      oldProps.storageType != this.props.storageType ||
      oldProps.programId != this.props.programId
    ) {
      this.props.loadProgram(this.props.storageType, this.props.programId);
    }
  }

  componentWillUnmount() {
    this.props.clearProgram();
  }

  handleCodeChanged = (code: string) => {
    this.props.codeChanged(code);
  };

  handleRunProgram = () => {
    this.props.runProgram();
  };

  handleStopProgram = () => {
    this.props.stopProgram();
  };

  getProgramImage = () => {
    return this.logoExecutorRef ? this.logoExecutorRef.createScreenshotBase64(false) : "";
  };

  getSmallProgramImage = () => {
    return this.logoExecutorRef ? this.logoExecutorRef.createScreenshotBase64(true) : "";
  };

  handleDeleteProgram = () => {
    this.props.deleteProgram();
  };

  handleRevertChanges = () => {
    this.props.revertChanges();
  };

  handleSave = () => {
    this.props.saveProgram(this.getSmallProgramImage());
  };

  handleSaveAs = (newName: string) => {
    this.props.saveAsProgram(newName, this.getSmallProgramImage());
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content is-fullscreen playground-page-component">
          <Loading isLoading={this.props.isLoading} fullPage />

          <ReactGoldenLayout
            className="golden-layout-container"
            configLayoutOverride={{
              settings: {
                showMaximiseIcon: false,
                showPopoutIcon: false,
                showCloseIcon: false
              },
              dimensions: { headerHeight: 32 }
            }}
            layoutLocalStorageKey={this.layoutLocalStorageKey}
            defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
            onLayoutChange={() =>
              this.setState({ resizeIncrement: this.state.resizeIncrement + 1 })
            }
          >
            <ReactGoldenLayoutPanel id="code-panel" title={this.buildCodePanelTitle()}>
              <CodeMenu
                isRunning={this.props.isRunning}
                code={this.props.code}
                programName={this.props.programName}
                onRunProgram={this.handleRunProgram}
                onStopProgram={this.handleStopProgram}
                createScreenShotImageBase64={this.getProgramImage}
                createSmallScreenShotImageBase64={this.getSmallProgramImage}
                isDeleteEnabled={this.props.storageType === ProgramStorageType.gallery}
                onDeleteProgram={this.handleDeleteProgram}
                isRevertEnabled={
                  this.props.hasModifications && this.props.storageType !== undefined
                }
                onRevertChanges={this.handleRevertChanges}
                isSaveEnabled={this.props.storageType === ProgramStorageType.gallery}
                onSave={this.handleSave}
                onSaveAs={this.handleSaveAs}
              />
              <CodeInput
                className="code-input-container"
                editorTheme={this.props.userSettings.editorTheme}
                code={this.props.code}
                onChanged={this.handleCodeChanged}
                hotKeys={["f9"]}
                onHotkey={this.handleRunProgram}
                resizeIncrement={this.state.resizeIncrement}
              />
            </ReactGoldenLayoutPanel>
            <ReactGoldenLayoutPanel id="output-panel" title={this.buildOutputPanelTitle()}>
              <LogoExecutor
                ref={ref => (this.logoExecutorRef = ref)}
                isRunning={this.props.isRunning}
                onFinish={this.handleStopProgram}
                code={this.props.code}
                isDarkTheme={this.props.userSettings.isDarkTheme}
                turtleImage={getTurtleImage(this.props.userSettings.turtleId)}
                turtleSize={this.props.userSettings.turtleSize}
              />
            </ReactGoldenLayoutPanel>
          </ReactGoldenLayout>
        </div>
      </div>
    );
  }

  private buildCodePanelTitle(): string {
    let title = `<i class="fa fa-code" aria-hidden="true"></i> `;
    if (!this.props.programId) {
      title += $T.program.codePanelTitle;
    } else {
      title += `${$T.program.program}: <strong>${this.props.programName}</strong>`;
      if (this.props.hasModifications) {
        title += ` <i class="fa fa-asterisk icon-sm" aria-hidden="true" title="${
          $T.program.programHasChanges
        }"></i>`;
      }
    }
    return title;
  }

  private buildOutputPanelTitle(): string {
    return `<i class="fas fa-desktop" aria-hidden="true"></i> ` + $T.program.outputPanelTitle;
  }
}
