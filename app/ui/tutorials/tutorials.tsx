import * as React from "react";
import { resolveInject } from "app/di";
import { $T } from "app/i18n/strings";
import { checkIsMobileDevice } from "app/utils/device-helper";
import { IUserSettingsService } from "app/services/customizations/user-settings.service";
import {
  ITutorialInfo,
  ITutorialStepContent,
  ITutorialStepInfo
} from "app/services/tutorials/tutorials-content-service";
import {
  EventsTrackingService,
  EventAction
} from "app/services/infrastructure/events-tracking.service";
import {
  tutorialsDefaultLayout,
  tutorialsDefaultMobileLayout
} from "app/ui/tutorials/tutorials-default-goldenlayout";
import { MainMenu } from "app/ui/main-menu";
import { Loading } from "app/ui/_generic/loading";
import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { TutorialView } from "app/ui/tutorials/tutorial-view";
import { CodeMenu } from "../code-menu/code-menu";
import { CodeInput } from "../_generic/code-input/code-input";
import { LogoExecutor } from "../_generic/logo-executor/logo-executor";

import "./tutorials.less";
import { MainMenuContainer } from "../main-menu.container";

interface State {}

interface Props {
  isLoading: boolean;
  isStepLoading: boolean;
  code: string;
  isRunning: boolean;
  tutorialId: string;
  stepId: string;
  tutorials?: ITutorialInfo[];
  currentTutorialInfo?: ITutorialInfo;
  currentStepInfo?: ITutorialStepInfo;
  currentStepContent?: ITutorialStepContent;
  loadStep(tutorialId: string, stepId: string): void;
  fixTheCode(): void;
  runProgram(): void;
  stopProgram(): void;
  codeChanged(code: string): void;
}

export class TutorialsPage extends React.Component<Props, State> {
  private userSettingsService = resolveInject(IUserSettingsService);
  private eventsTracking = resolveInject(EventsTrackingService);

  private isMobileDevice = checkIsMobileDevice();
  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? tutorialsDefaultMobileLayout : tutorialsDefaultLayout
  );
  private layoutLocalStorageKey =
    this.userSettingsService.userSettingsKey +
    ":tutorials-layout" +
    (this.isMobileDevice ? "-mobile" : "-desktop");
  private logoExecutorRef: LogoExecutor | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {};
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
        <div className="ex-page-content tutorials-page-component">
          {this.props.isLoading && (
            <div className="main-loading-container">
              <Loading isLoading />
            </div>
          )}
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
            onLayoutChange={() => {
              /** */
            }}
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
                editorTheme="eclipse"
                code={this.props.code}
                onChanged={this.handleCodeChanged}
              />
            </ReactGoldenLayoutPanel>
            <ReactGoldenLayoutPanel
              id="output-panel"
              title={`<i class="fa fa-television" aria-hidden="true"></i> ${
                $T.program.outputPanelTitle
              }`}
            >
              <LogoExecutor
                ref={ref => (this.logoExecutorRef = ref)}
                isRunning={this.props.isRunning}
                onFinish={this.handleStopProgram}
                code={this.props.code}
                isDarkTheme={false}
              />
            </ReactGoldenLayoutPanel>
            <ReactGoldenLayoutPanel
              id="tutorial-panel"
              title={`<i class="fa fa-graduation-cap" aria-hidden="true"></i> ${
                $T.tutorial.tutorialPanelTitle
              }`}
            >
              {!this.props.isStepLoading &&
              this.props.tutorials &&
              this.props.currentTutorialInfo &&
              this.props.currentStepInfo &&
              this.props.currentStepContent ? (
                <TutorialView
                  tutorials={this.props.tutorials}
                  currentTutorialInfo={this.props.currentTutorialInfo}
                  currentStepInfo={this.props.currentStepInfo}
                  currentStepContent={this.props.currentStepContent}
                  onNavigationRequest={this.handleNavigationRequest}
                  onFixTheCode={this.handleFixTheCode}
                />
              ) : (
                <Loading isLoading />
              )}
            </ReactGoldenLayoutPanel>
          </ReactGoldenLayout>
        </div>
      </div>
    );
  }
}
