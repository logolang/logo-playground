import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";
import { as } from "app/utils/syntax-helpers";

import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ProgramModel } from "app/services/program/program.model";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { ProgramManagementService, ProgramStorageType } from "app/services/program/program-management.service";
import { ITutorialsContentService, ITutorialInfo } from "app/services/tutorials/tutorials-content-service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutConfig, GoldenLayoutComponent, IPanelConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";
import {
  TutorialViewComponent,
  ITutorialViewComponentProps,
  ITutorialNavigationRequest,
  ITutorialRequestData,
  ITutorialLoadedData
} from "app/ui/tutorials/tutorial-view.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { tutorialsDefaultLayout, tutorialsDefaultMobileLayout } from "app/ui/tutorials/tutorials-default-goldenlayout";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  theme?: Theme;
  turtleImage?: HTMLImageElement;
  tutorials?: ITutorialInfo[];
  tutorialId?: string;
  stepId?: string;
  program?: ProgramModel;
}

interface IComponentProps extends RouteComponentProps<ITutorialPageRouteParams> {}

export interface ITutorialPageRouteParams {
  tutorialId: string;
  stepId: string;
}

export class TutorialsPageComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(INotificationService);
  private navService = resolveInject(INavigationService);
  private titleService = resolveInject(TitleService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private tutorialsLoader = resolveInject(ITutorialsContentService);
  private eventsTracking = resolveInject(IEventsTrackingService);

  private executionService = new ProgramExecutionContext();
  private codeChangesStream = new Subject<string>();

  private defaultLayoutConfigJSON: string;

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
    this.setState({ isLoading: false });
  };

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Tutorials"));
    this.eventsTracking.sendEvent(EventAction.tutorialsOpen);
    const isMobile = window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches;
    this.defaultLayoutConfigJSON = isMobile
      ? JSON.stringify(tutorialsDefaultMobileLayout)
      : JSON.stringify(tutorialsDefaultLayout);
    await this.loadData(this.props);
  }

  componentWillUnmount() {
    /** */
  }

  layoutChanged = (newLayoutJSON: string): void => {
    this.userSettingsService.update({ tutorialsLayoutJSON: newLayoutJSON });
  };

  async loadData(props: IComponentProps) {
    this.setState({
      isLoading: true
    });

    const userSettings = await callActionSafe(this.errorHandler, async () => this.userSettingsService.get());
    if (!userSettings) {
      return;
    }
    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);
    const tutorials = await callActionSafe(this.errorHandler, async () => this.tutorialsLoader.getTutorialsList());
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
      stepId
    });
  }

  onFixTheCode = (code: string) => {
    if (this.state.program) {
      this.codeChangesStream.next(code);
      this.eventsTracking.sendEvent(EventAction.tutorialsFixTheCode);
    }
  };

  onLoadedTutorial = (tutorialId: string, stepId: string, initCode: string) => {
    if (this.state.program) {
      this.codeChangesStream.next(initCode);
      this.executionService.executeProgram(initCode);
    }

    this.userSettingsService.update({
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
        <div className="ex-page-content">
          {this.state.isLoading && (
            <div className="golden-layout-component">
              <div className="ex-page-content lm_content">
                <LoadingComponent isLoading />
              </div>
            </div>
          )}

          {!this.state.isLoading &&
            this.state.userSettings &&
            this.state.theme &&
            this.state.tutorials &&
            this.state.tutorialId &&
            this.state.stepId &&
            this.state.program && (
              <GoldenLayoutComponent
                initialLayoutConfigJSON={this.state.userSettings.tutorialsLayoutJSON || ""}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={this.layoutChanged}
                panelsReloadCheck={() => false}
                panels={[
                  as<IPanelConfig<TutorialViewComponent, ITutorialViewComponentProps>>({
                    title: new BehaviorSubject(
                      `<i class="fa fa-graduation-cap" aria-hidden="true"></i> ` + _T("Tutorial")
                    ),
                    componentName: "tutorial-panel",
                    componentType: TutorialViewComponent,
                    props: {
                      onFixTheCode: this.onFixTheCode,
                      onLoadedTutorial: this.onLoadedTutorial,
                      initialStepId: this.state.stepId,
                      initialTutorialId: this.state.tutorialId,
                      tutorials: this.state.tutorials
                    }
                  }),
                  as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                    title: new BehaviorSubject(`<i class="fa fa-code" aria-hidden="true"></i> ` + _T("Code")),
                    componentName: "code-panel",
                    componentType: CodePanelComponent,
                    props: {
                      editorTheme: this.state.theme.codeEditorThemeName,
                      executionService: this.executionService,
                      program: this.state.program,
                      saveCurrentEnabled: false,
                      navigateAutomaticallyAfterSaveAs: false,
                      externalCodeChanges: this.codeChangesStream
                    }
                  }),
                  as<IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>>({
                    title: new BehaviorSubject(`<i class="fa fa-television" aria-hidden="true"></i> ` + _T("Output")),
                    componentName: "output-panel",
                    componentType: OutputPanelComponent,
                    props: {
                      logoExecutorProps: {
                        runCommands: this.executionService.runCommands,
                        stopCommands: this.executionService.stopCommands,
                        makeScreenshotCommands: this.executionService.makeScreenshotCommands,
                        onIsRunningChanged: this.executionService.onIsRunningChanged,
                        isDarkTheme: this.state.theme.isDark,
                        customTurtleImage: this.state.turtleImage,
                        customTurtleSize: this.state.userSettings.turtleSize
                      }
                    }
                  })
                ]}
              />
            )}
        </div>
      </div>
    );
  }
}
