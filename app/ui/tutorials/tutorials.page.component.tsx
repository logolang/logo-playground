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
import { ProgramModel } from "app/services/program/program.model";
import { ProgramModelConverter } from "app/services/program/program-model.converter";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { TutorialsContentService, ITutorialInfo } from "app/services/tutorials/tutorials-content-service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { tutorialsDefaultLayout, tutorialsDefaultMobileLayout } from "app/ui/tutorials/tutorials-default-goldenlayout";
import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { CodePanelComponent } from "app/ui/code-panel/code-panel.component";
import { LogoExecutorComponent } from "app/ui/_generic/logo-executor/logo-executor.component";
import { TutorialViewComponent } from "app/ui/tutorials/tutorial-view.component";

import "./tutorials.page.component.less";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  theme?: Theme;
  turtleImage?: HTMLImageElement;
  tutorials?: ITutorialInfo[];
  tutorialId?: string;
  stepId?: string;
  program?: ProgramModel;
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
  private codeChangesStream = new Subject<string>();
  private layoutChangesStream = new Subject<void>();

  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? tutorialsDefaultMobileLayout : tutorialsDefaultLayout
  );

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.tutorial.tutorialsTitle);
    this.eventsTracking.sendEvent(EventAction.tutorialsOpen);
    await this.loadData(this.props);
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

    const program = ProgramModelConverter.createNewProgram(undefined, "", "", "");

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
      program,
      tutorialId,
      stepId,
      layoutLocalStorageKey:
        this.userSettingsService.userSettingsKey + ":tutorials-layout" + (this.isMobileDevice ? "-mobile" : "-desktop")
    });
  }

  onFixTheCode = (code: string) => {
    if (this.state.program) {
      this.codeChangesStream.next(code);
      this.eventsTracking.sendEvent(EventAction.tutorialsFixTheCode);
    }
  };

  onLoadedTutorial = async (tutorialId: string, stepId: string, initCode: string) => {
    if (this.state.program) {
      this.codeChangesStream.next(initCode);
      this.executionContext.executeProgram(initCode);
    }

    await this.userSettingsService.update({
      currentTutorialInfo: {
        tutorialId,
        stepId
      }
    });

    this.navService.navigate({
      route: Routes.tutorialSpecified.build({
        tutorialId: tutorialId,
        stepId: stepId
      })
    });
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

          {!this.state.isLoading &&
            this.state.userSettings &&
            this.state.theme &&
            this.state.tutorials &&
            this.state.tutorialId &&
            this.state.stepId &&
            this.state.program && (
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
              >
                <ReactGoldenLayoutPanel
                  id="code-panel"
                  title={`<i class="fa fa-code" aria-hidden="true"></i> ${$T.program.code}`}
                >
                  <CodePanelComponent
                    saveCurrentEnabled={false}
                    program={this.state.program}
                    editorTheme={this.state.theme.codeEditorThemeName}
                    executionContext={this.executionContext}
                    resizeEvents={this.layoutChangesStream}
                    externalCodeChanges={this.codeChangesStream}
                  />
                </ReactGoldenLayoutPanel>
                <ReactGoldenLayoutPanel
                  id="output-panel"
                  title={`<i class="fa fa-television" aria-hidden="true"></i> ${$T.program.output}`}
                >
                  <LogoExecutorComponent
                    runCommands={this.executionContext.runCommands}
                    stopCommands={this.executionContext.stopCommands}
                    makeScreenshotCommands={this.executionContext.makeScreenshotCommands}
                    onIsRunningChange={this.executionContext.onIsRunningChange}
                    isDarkTheme={this.state.theme.isDark}
                    customTurtleImage={this.state.turtleImage}
                    customTurtleSize={this.state.userSettings.turtleSize}
                  />
                </ReactGoldenLayoutPanel>
                <ReactGoldenLayoutPanel
                  id="tutorial-panel"
                  title={`<i class="fa fa-graduation-cap" aria-hidden="true"></i> ${$T.tutorial.tutorialsTitle}`}
                >
                  <TutorialViewComponent
                    onFixTheCode={this.onFixTheCode}
                    onLoadedTutorial={this.onLoadedTutorial}
                    initialStepId={this.state.stepId}
                    initialTutorialId={this.state.tutorialId}
                    tutorials={this.state.tutorials}
                  />
                </ReactGoldenLayoutPanel>
              </ReactGoldenLayout>
            )}
        </div>
      </div>
    );
  }
}
