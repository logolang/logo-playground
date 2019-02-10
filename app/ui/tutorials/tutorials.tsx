import * as React from "react";
import { resolve } from "app/di";
import { $T } from "app/i18n-strings";

import { checkIsMobileDevice } from "app/utils/device";
import {
  TutorialInfo,
  TutorialStepContent,
  TutorialStepInfo
} from "app/services/tutorials/tutorials-content-service";
import { UserSettings } from "app/services/env/user-settings";
import { EventsTrackingService, EventAction } from "app/services/env/events-tracking.service";
import { localStoragePrefix } from "app/services/constants";

import {
  tutorialsDefaultLayout,
  tutorialsDefaultMobileLayout
} from "app/ui/tutorials/tutorials-default-goldenlayout";
import { Loading } from "app/ui/_generic/loading";
import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { TutorialView } from "app/ui/tutorials/tutorial-view";
import { CodeMenu } from "app/ui/code-menu/code-menu";
import { CodeInput } from "app/ui/_generic/code-input/code-input";
import { LogoExecutor } from "app/ui/_generic/logo-executor/logo-executor";
import { MainMenuContainer } from "app/ui/main-menu.container";
import { getTurtleImage } from "app/ui/turtles/turtles";

import "./tutorials.less";

interface State {
  resizeIncrement: number;
}

interface Props {
  isLoading: boolean;
  isStepLoading: boolean;
  code: string;
  isRunning: boolean;
  tutorialId: string;
  stepId: string;
  tutorials?: TutorialInfo[];
  currentTutorialInfo?: TutorialInfo;
  currentStepInfo?: TutorialStepInfo;
  currentStepContent?: TutorialStepContent;
  userSettings: UserSettings;
  loadStep(tutorialId: string, stepId: string): void;
  fixTheCode(): void;
  runProgram(): void;
  stopProgram(): void;
  codeChanged(code: string): void;
}

export class TutorialsPage extends React.Component<Props, State> {
  private eventsTracking = resolve(EventsTrackingService);

  private isMobileDevice = checkIsMobileDevice();
  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? tutorialsDefaultMobileLayout : tutorialsDefaultLayout
  );
  private layoutLocalStorageKey =
    localStoragePrefix + "tutorials-layout" + (this.isMobileDevice ? "-mobile" : "-desktop");
  private logoExecutorRef: LogoExecutor | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { resizeIncrement: 1 };
  }

  async componentDidMount() {
    this.eventsTracking.sendEvent(EventAction.tutorialsOpen);
    this.props.loadStep(this.props.tutorialId, this.props.stepId);
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

  handleSaveAs = (newName: string) => {
    alert("Not implemented yet " + newName);
  };

  handleFixTheCode = () => {
    this.props.fixTheCode();
  };

  handleNavigationRequest = (tutorialId: string, stepId: string) => {
    this.props.loadStep(tutorialId, stepId);
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content is-fullscreen tutorials-page-component">
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
            <ReactGoldenLayoutPanel
              id="code-panel"
              title={`<i class="fa fa-code" aria-hidden="true"></i> ${$T.program.codePanelTitle}`}
            >
              <CodeMenu
                isRunning={this.props.isRunning}
                code={this.props.code}
                programName={"Tutorial"}
                onRunProgram={this.handleRunProgram}
                onStopProgram={this.handleStopProgram}
                createScreenShotImageBase64={this.getProgramImage}
                createSmallScreenShotImageBase64={this.getSmallProgramImage}
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
            <ReactGoldenLayoutPanel
              id="output-panel"
              title={`<i class="fas fa-desktop" aria-hidden="true"></i> ${
                $T.program.outputPanelTitle
              }`}
            >
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
            <ReactGoldenLayoutPanel
              id="tutorial-panel"
              title={`<i class="fa fa-graduation-cap" aria-hidden="true"></i> ${
                $T.tutorial.tutorialPanelTitle
              }`}
            >
              <Loading isLoading={this.props.isStepLoading && !this.props.isLoading} />

              {!this.props.isStepLoading &&
                this.props.tutorials &&
                this.props.currentTutorialInfo &&
                this.props.currentStepInfo &&
                this.props.currentStepContent && (
                  <TutorialView
                    tutorials={this.props.tutorials}
                    currentTutorialInfo={this.props.currentTutorialInfo}
                    currentStepInfo={this.props.currentStepInfo}
                    currentStepContent={this.props.currentStepContent}
                    onNavigationRequest={this.handleNavigationRequest}
                    onFixTheCode={this.handleFixTheCode}
                  />
                )}
            </ReactGoldenLayoutPanel>
          </ReactGoldenLayout>
        </div>
      </div>
    );
  }
}
