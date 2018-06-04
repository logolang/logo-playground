import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { callActionSafe, ErrorDef } from "app/utils/error-helpers";
import { as } from "app/utils/syntax-helpers";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { $T } from "app/i18n/strings";
import { checkIsMobileDevice } from "app/utils/device-helper";
import { NotificationService } from "app/services/infrastructure/notification.service";
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
import { GoldenLayoutComponent, IPanelConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";
import { TutorialViewComponent, ITutorialViewComponentProps } from "app/ui/tutorials/tutorial-view.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  theme?: Theme;
  turtleImage?: HTMLImageElement;
  tutorials?: ITutorialInfo[];
  tutorialId?: string;
  stepId?: string;
  program?: ProgramModel;
  pageLayoutConfigJSON?: string;
}

interface IComponentProps extends RouteComponentProps<ITutorialPageRouteParams> {}

export interface ITutorialPageRouteParams {
  tutorialId: string;
  stepId: string;
}

export class TutorialsPageComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(NotificationService);
  private navService = resolveInject(NavigationService);
  private errorService = resolveInject(ErrorService);
  private titleService = resolveInject(TitleService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private tutorialsLoader = resolveInject(TutorialsContentService);
  private eventsTracking = resolveInject(EventsTrackingService);

  private isMobileDevice = checkIsMobileDevice();
  private executionService = new ProgramExecutionContext();
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

  layoutChanged = async (newLayoutJSON: string) => {
    await this.userSettingsService.update(
      this.isMobileDevice ? { tutorialsLayoutMobileJSON: newLayoutJSON } : { tutorialsLayoutJSON: newLayoutJSON }
    );
    this.layoutChangesStream.next();
  };

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
      pageLayoutConfigJSON: this.isMobileDevice
        ? userSettings.tutorialsLayoutMobileJSON
        : userSettings.tutorialsLayoutJSON
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
      this.executionService.executeProgram(initCode);
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
                initialLayoutConfigJSON={this.state.pageLayoutConfigJSON}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={this.layoutChanged}
                panelsReloadCheck={() => false}
                panels={[
                  as<IPanelConfig<TutorialViewComponent, ITutorialViewComponentProps>>({
                    title: new BehaviorSubject(
                      `<i class="fa fa-graduation-cap" aria-hidden="true"></i> ` + $T.tutorial.tutorialsTitle
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
                    title: new BehaviorSubject(`<i class="fa fa-code" aria-hidden="true"></i> ` + $T.program.code),
                    componentName: "code-panel",
                    componentType: CodePanelComponent,
                    props: {
                      editorTheme: this.state.theme.codeEditorThemeName,
                      executionService: this.executionService,
                      program: this.state.program,
                      saveCurrentEnabled: false,
                      externalCodeChanges: this.codeChangesStream,
                      containerResized: this.layoutChangesStream
                    }
                  }),
                  as<IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>>({
                    title: new BehaviorSubject(
                      `<i class="fa fa-television" aria-hidden="true"></i> ` + $T.program.output
                    ),
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
