import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs/Subject";

import { callActionSafe } from "app/utils/error-helpers";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { $T } from "app/i18n/strings";
import { checkIsMobileDevice } from "app/utils/device-helper";
import { ErrorService } from "app/services/infrastructure/error.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import {
  TutorialsContentService,
  ITutorialInfo,
  ITutorialStepContent
} from "app/services/tutorials/tutorials-content-service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { tutorialsDefaultLayout, tutorialsDefaultMobileLayout } from "app/ui/tutorials/tutorials-default-goldenlayout";
import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { CodePanelComponent } from "app/ui/code-panel/code-panel.component";
import { TutorialViewComponent } from "app/ui/tutorials/tutorial-view.component";
import { OutputPanelComponent } from "app/ui/output-panel/output-panel.component";

import "./tutorials.page.component.less";

interface IComponentState {
  isLoading: boolean;

  tutorials?: ITutorialInfo[];
  tutorialId?: string;
  stepId?: string;

  programCode: string;

  userSettings?: IUserSettings;
  theme?: Theme;
  turtleImage?: HTMLImageElement;
  layoutLocalStorageKey?: string;
}

interface IComponentProps extends RouteComponentProps<ITutorialPageRouteParams> {}

export interface ITutorialPageRouteParams {
  tutorialId: string;
  stepId: string;
}

export class TutorialsPageComponent extends React.Component<IComponentProps, IComponentState> {
  private navService = resolveInject(NavigationService);
  private errorService = resolveInject(ErrorService);
  private titleService = resolveInject(TitleService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private tutorialsLoader = resolveInject(TutorialsContentService);
  private eventsTracking = resolveInject(EventsTrackingService);

  private isMobileDevice = checkIsMobileDevice();
  private executionContext = new ProgramExecutionContext();
  private resizeEventsSubject = new Subject<void>();

  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? tutorialsDefaultMobileLayout : tutorialsDefaultLayout
  );

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      programCode: ""
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.tutorial.tutorialsTitle);
    this.eventsTracking.sendEvent(EventAction.tutorialsOpen);
    await this.loadData(this.props);
  }

  async componentWillReceiveProps(newProps: IComponentProps) {
    if (
      newProps.match.params.tutorialId != this.state.tutorialId ||
      newProps.match.params.stepId != this.state.stepId
    ) {
      await this.loadData(newProps);
    }
  }

  componentWillUnmount() {
    /** */
  }

  async loadData(props: IComponentProps) {
    this.setState({
      isLoading: true
    });

    const userSettings = await callActionSafe(this.errorService.handleError, async () =>
      this.userSettingsService.get()
    );
    if (!userSettings) {
      return;
    }
    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);
    const tutorials = await callActionSafe(this.errorService.handleError, async () =>
      this.tutorialsLoader.getTutorialsList()
    );
    if (!tutorials) {
      return;
    }

    let tutorialId = props.match.params.tutorialId;
    let stepId = props.match.params.stepId;
    if (!tutorialId || !stepId) {
      if (userSettings.currentTutorialInfo) {
        tutorialId = userSettings.currentTutorialInfo.tutorialId;
        stepId = userSettings.currentTutorialInfo.stepId;
      } else {
        tutorialId = tutorials[0].id;
        stepId = tutorials[0].steps[0].id;
      }
    }

    this.setState({
      isLoading: false,
      userSettings,
      turtleImage,
      theme,
      tutorials,
      programCode: "",
      tutorialId,
      stepId,
      layoutLocalStorageKey:
        this.userSettingsService.userSettingsKey + ":tutorials-layout" + (this.isMobileDevice ? "-mobile" : "-desktop")
    });
  }

  handleLoadedTutorial = async (content: ITutorialStepContent) => {
    if (content.initialCode) {
      this.setState({ programCode: content.initialCode });
      this.executionContext.executeProgram(content.initialCode);
    }
  };

  handleNavigationRequest = async (tutorialId: string, stepId: string) => {
    await this.userSettingsService.update({
      currentTutorialInfo: { tutorialId, stepId }
    });
    this.navService.navigate({
      route: Routes.tutorialSpecified.build({ tutorialId, stepId })
    });
  };

  fixTheCode = (code: string) => {
    this.setState({ programCode: code });
    this.executionContext.executeProgram(code);
    this.eventsTracking.sendEvent(EventAction.tutorialsFixTheCode);
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content tutorials-page-component">
          {this.state.isLoading && (
            <div className="main-loading-container">
              <LoadingComponent isLoading />
            </div>
          )}

          {this.state.userSettings &&
            this.state.theme &&
            this.state.tutorials &&
            this.state.tutorialId &&
            this.state.stepId && (
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
                layoutLocalStorageKey={this.state.layoutLocalStorageKey}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={() => this.resizeEventsSubject.next()}
              >
                <ReactGoldenLayoutPanel
                  id="code-panel"
                  title={`<i class="fa fa-code" aria-hidden="true"></i> ${$T.program.codePanelTitle}`}
                >
                  <CodePanelComponent
                    programName="Tutorial"
                    programCode={this.state.programCode}
                    hasChanges={false}
                    executionContext={this.executionContext}
                    onCodeChange={newCode => this.setState({ programCode: newCode })}
                    editorTheme={this.state.theme.codeEditorThemeName}
                    resizeEvents={this.resizeEventsSubject}
                  />
                </ReactGoldenLayoutPanel>
                <ReactGoldenLayoutPanel
                  id="output-panel"
                  title={`<i class="fa fa-television" aria-hidden="true"></i> ${$T.program.outputPanelTitle}`}
                >
                  <OutputPanelComponent
                    executionContext={this.executionContext}
                    isDarkTheme={this.state.theme.isDark}
                    turtleImage={this.state.turtleImage}
                    turtleSize={this.state.userSettings.turtleSize}
                  />
                </ReactGoldenLayoutPanel>
                <ReactGoldenLayoutPanel
                  id="tutorial-panel"
                  title={`<i class="fa fa-graduation-cap" aria-hidden="true"></i> ${$T.tutorial.tutorialPanelTitle}`}
                >
                  <TutorialViewComponent
                    tutorials={this.state.tutorials}
                    tutorialId={this.state.tutorialId}
                    stepId={this.state.stepId}
                    onTutorialContentLoaded={this.handleLoadedTutorial}
                    onNavigationRequest={this.handleNavigationRequest}
                    onFixTheCode={this.fixTheCode}
                  />
                </ReactGoldenLayoutPanel>
              </ReactGoldenLayout>
            )}
        </div>
      </div>
    );
  }
}
