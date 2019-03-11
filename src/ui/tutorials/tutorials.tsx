import * as React from "react";
import { resolve } from "utils/di";
import { $T } from "i18n-strings";

import { checkIsMobileDevice } from "utils/device";
import { TutorialInfo, TutorialStepContent, TutorialStepInfo } from "services/tutorials-service";
import { UserSettings } from "services/user-settings";
import { Theme } from "ui/themes-helper";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";
import { localStoragePrefix } from "services/constants";

import {
  tutorialsDefaultLayout,
  tutorialsDefaultMobileLayout
} from "ui/tutorials/tutorials-default-goldenlayout";
import { Loading } from "ui/_generic/loading";
import { ReactGoldenLayout } from "ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "ui/_generic/react-golden-layout/react-golden-layout-panel";
import { TutorialView } from "ui/tutorials/tutorial-view";
import { CodeMenu } from "ui/code-menu/code-menu";
import { CodeInput } from "ui/_generic/code-input/code-input";
import { LogoExecutor } from "ui/_generic/logo-executor/logo-executor";
import { MainMenuContainer } from "ui/main-menu.container";
import { getTurtleImage } from "ui/turtles/turtles";

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
  appTheme: Theme;
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
  private logoExecutorRef?: LogoExecutor;

  constructor(props: Props) {
    super(props);
    this.state = { resizeIncrement: 1 };
  }

  async componentDidMount() {
    this.eventsTracking.sendEvent(EventAction.openTutorials);
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

  handleFixTheCode = () => {
    this.eventsTracking.sendEvent(EventAction.tutorialsFixTheCode);
    this.props.fixTheCode();
  };

  handleNavigationRequest = (tutorialId: string, stepId: string) => {
    this.eventsTracking.sendEvent(EventAction.tutorialsNavigation);
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
              />
              <CodeInput
                className="code-input-container"
                editorTheme={this.props.appTheme.codeEditorThemeName}
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
                ref={ref => (this.logoExecutorRef = ref || undefined)}
                isRunning={this.props.isRunning}
                onFinish={this.handleStopProgram}
                code={this.props.code}
                isDarkTheme={this.props.appTheme.isDark}
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
