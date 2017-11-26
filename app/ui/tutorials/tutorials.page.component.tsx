import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs";

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
import {
  IEventsTrackingService,
  EventCategory,
  EventAction
} from "app/services/infrastructure/events-tracking.service";

interface IComponentState {
  isLoading: boolean;
  pageLayoutConfigJSON?: string;
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
  private programManagementService = resolveInject(ProgramManagementService);
  private tutorialsLoader = resolveInject(ITutorialsContentService);
  private eventsTracking = resolveInject(IEventsTrackingService);

  private executionService = new ProgramExecutionContext();
  private fixTheCodeStream = new Subject<string>();

  private defaultLayoutConfigJSON = JSON.stringify({
    content: [
      {
        type: "row",
        content: [
          {
            title: "",
            type: "react-component",
            component: "tutorial-panel",
            componentName: "tutorial-panel",
            width: 40,
            isClosable: false
          },
          {
            type: "column",
            width: 60,
            content: [
              {
                title: "",
                type: "react-component",
                component: "output-panel",
                componentName: "output-panel",
                height: 60,
                isClosable: false
              },
              {
                title: "",
                type: "react-component",
                component: "code-panel",
                componentName: "code-panel",
                height: 40,
                isClosable: false
              }
            ]
          }
        ]
      }
    ]
  });

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
    this.setState({ isLoading: false });
  };

  constructor(props: IComponentProps) {
    super(props);
    this.state = this.buildDefaultState(this.props);
    subscribeLoadDataOnPropsParamsChange(this);
  }

  buildDefaultState(props: IComponentProps): IComponentState {
    const state: IComponentState = {
      isLoading: true
    };
    return state;
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Tutorials"));
    await this.loadData(this.props);

    this.eventsTracking.setEvent({ category: EventCategory.tutorials, action: EventAction.tutorialsOpen });
  }

  componentWillUnmount() {
    /** */
  }

  layoutChanged = (newLayoutJSON: string): void => {
    this.userSettingsService.update({ tutorialsLayoutJSON: newLayoutJSON });
  };

  async loadData(props: IComponentProps) {
    const userSettings = await callActionSafe(this.errorHandler, async () => this.userSettingsService.get());
    if (!userSettings) {
      return;
    }

    const lastTutorialInfo = userSettings.currentTutorialInfo || {
      tutorialId: "",
      stepId: ""
    };
    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);
    const tutorials = await this.tutorialsLoader.getTutorialsList();

    const tutorialId = props.match.params.tutorialId;
    const stepId = props.match.params.stepId;
    if (!tutorialId || !stepId) {
      if (lastTutorialInfo.tutorialId && lastTutorialInfo.stepId) {
        this.navService.navigate({
          route: Routes.tutorialSpecified.build({
            tutorialId: lastTutorialInfo.tutorialId,
            stepId: lastTutorialInfo.stepId
          })
        });
        return;
      } else {
        this.navService.navigate({
          route: Routes.tutorialSpecified.build({
            tutorialId: tutorials[0].id,
            stepId: tutorials[0].steps[0].id
          })
        });
        return;
      }
    }

    const program = await this.programManagementService.loadProgram(
      tutorialId + ":" + stepId,
      ProgramStorageType.tutorial
    );

    this.userSettingsService.update({
      currentTutorialInfo: {
        tutorialId,
        stepId
      }
    });

    this.setState({
      isLoading: false,
      pageLayoutConfigJSON: userSettings.tutorialsLayoutJSON,
      userSettings,
      turtleImage,
      theme,
      tutorials,
      tutorialId,
      stepId,
      program
    });
  }

  onFixTheCode = (code: string) => {
    if (this.state.program) {
      this.programManagementService.saveTempProgram(this.state.program.id, "");
      this.fixTheCodeStream.next(code);

      this.eventsTracking.setEvent({ category: EventCategory.tutorials, action: EventAction.tutorialsFixTheCode });
    }
  };

  onNavigateRequest = async (tutorialId: string, stepId: string) => {
    if (this.state.program) {
      await this.programManagementService.revertLocalTempChanges(this.state.program);
    }
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
          <LoadingComponent fullPage isLoading={this.state.isLoading} />
          {this.state.userSettings &&
            this.state.theme &&
            this.state.tutorials &&
            this.state.tutorialId &&
            this.state.stepId &&
            this.state.program && (
              <GoldenLayoutComponent
                initialLayoutConfigJSON={this.state.pageLayoutConfigJSON || ""}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={this.layoutChanged}
                panelsReloadCheck={(oldPanels, newPanels) => {
                  if (
                    oldPanels[0].props.currentStepId !== newPanels[0].props.currentStepId ||
                    oldPanels[0].props.currentTutorialId !== newPanels[0].props.currentTutorialId
                  ) {
                    return true;
                  }
                  return false;
                }}
                panels={[
                  as<IPanelConfig<TutorialViewComponent, ITutorialViewComponentProps>>({
                    title: `<i class="fa fa-graduation-cap" aria-hidden="true"></i> ` + _T("Tutorial"),
                    componentName: "tutorial-panel",
                    componentType: TutorialViewComponent,
                    props: {
                      onFixTheCode: this.onFixTheCode,
                      onNavigateRequest: this.onNavigateRequest,
                      currentStepId: this.state.stepId,
                      currentTutorialId: this.state.tutorialId,
                      tutorials: this.state.tutorials
                    }
                  }),
                  as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                    title: `<i class="fa fa-code" aria-hidden="true"></i> ` + _T("Code"),
                    componentName: "code-panel",
                    componentType: CodePanelComponent,
                    props: {
                      editorTheme: this.state.theme.codeEditorThemeName,
                      executionService: this.executionService,
                      program: this.state.program,
                      saveCurrentEnabled: false,
                      navigateAutomaticallyAfterSaveAs: false,
                      externalCodeChanges: this.fixTheCodeStream,
                      doNotShowLocalChangesIndicator: true
                    }
                  }),
                  as<IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>>({
                    title: `<i class="fa fa-television" aria-hidden="true"></i> ` + _T("Output"),
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
