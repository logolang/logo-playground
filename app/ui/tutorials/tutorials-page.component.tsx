import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject, Subscription } from "rxjs";

import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";
import { callActionSafe } from "app/utils/async-helpers";
import { as } from "app/utils/syntax-helpers";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";

import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";

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
import { ProgramModel } from "app/services/program/program.model";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";

interface IComponentState {
  isLoading: boolean;
  layoutReRenderIncrement: number;
  pageLayoutConfig?: GoldenLayoutConfig;
  userSettings?: IUserSettings;
  theme?: Theme;
  turtleImage?: HTMLImageElement;
}

interface IComponentProps extends RouteComponentProps<ITutorialPageRouteParams> {}

export interface ITutorialPageRouteParams {
  tutorialId: string;
  stepIndex: string;
}

export class TutorialsPageComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(INotificationService) private notificationService: INotificationService;
  @lazyInject(INavigationService) private navService: INavigationService;
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(IUserSettingsService) private userSerttingsService: IUserSettingsService;
  @lazyInject(ThemesService) private themesService: ThemesService;
  @lazyInject(TurtlesService) private turtlesService: TurtlesService;

  private executionService = new ProgramExecutionService();
  private tutorialLoadRequest = new Subject<ITutorialRequestData>();
  private tutorialLoadedStream = new Subject<ITutorialLoadedData>();
  private tutorialNavigationStream = new Subject<ITutorialNavigationRequest>();
  private fixTheCodeStream = new Subject<string>();

  private defaultLayoutConfig: GoldenLayoutConfig = {
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
  };
  private layoutChangeSubject = new Subject<GoldenLayoutConfig>();
  private subscriptions: Subscription[] = [];

  private errorHandler = (err: string) => {
    this.notificationService.push({ message: err, type: "danger" });
    this.setState({ isLoading: false });
  };

  constructor(props: IComponentProps) {
    super(props);
    this.state = this.buildDefaultState(this.props);
    subscribeLoadDataOnPropsParamsChange(this);
  }

  buildDefaultState(props: IComponentProps): IComponentState {
    const state: IComponentState = {
      isLoading: true,
      layoutReRenderIncrement: 0
    };
    return state;
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Tutorials"));
    await this.loadData(this.props);
    this.executionService.initHotkeys();
    this.subscriptions.push(this.layoutChangeSubject.subscribe(this.layoutChanged));
    this.subscriptions.push(this.tutorialNavigationStream.subscribe(this.onTutorialNavigationRequest));
    this.subscriptions.push(this.tutorialLoadedStream.subscribe(this.onTutorialLoaded));
    this.subscriptions.push(this.fixTheCodeStream.subscribe(this.onFixTheCodeRequest));
  }

  componentWillUnmount() {
    this.executionService.disposeHotkeys();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  layoutChanged = (newLayout: GoldenLayoutConfig): void => {
    this.setState({ pageLayoutConfig: newLayout });
    console.log("hoi layout", newLayout);
    //this.userDataService.setPlaygroundLayoutJSON(JSON.stringify(newLayout));
  };

  async loadData(props: IComponentProps) {
    const userSettings = await callActionSafe(this.errorHandler, async () => this.userSerttingsService.get());
    if (!userSettings) {
      return;
    }

    const layoutConfig = this.defaultLayoutConfig;

    const lastTutorialInfo = userSettings.currentTutorialInfo || {
      code: "",
      tutorialName: "",
      step: 0
    };
    const initialCode = lastTutorialInfo.code;
    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);

    const tutorialIdToLoad = props.match.params.tutorialId;
    const stepIndex = this.parseStepIndexFromParam(props.match.params.stepIndex);
    if (!tutorialIdToLoad) {
      if (lastTutorialInfo.tutorialName) {
        this.navService.navigate({
          route: Routes.tutorialSpecified.build({
            tutorialId: lastTutorialInfo.tutorialName,
            stepIndex: this.formatStepIndexToParam(lastTutorialInfo.step)
          })
        });
        return;
      }
    }

    this.setState({
      isLoading: false,
      layoutReRenderIncrement: this.state.layoutReRenderIncrement + 1,
      pageLayoutConfig: layoutConfig,
      userSettings,
      turtleImage,
      theme
    });

    const tutorialInfo: ITutorialRequestData = {
      tutorialId: tutorialIdToLoad,
      stepIndex: stepIndex,
      code: initialCode
    };
    this.tutorialLoadRequest.next(tutorialInfo);
  }

  private parseStepIndexFromParam(stepIndexFromParam: string) {
    const stepIndex = parseInt(stepIndexFromParam, 10);
    if (isNaN(stepIndex)) {
      return 0;
    }
    return stepIndex - 1;
  }

  private formatStepIndexToParam(stepIndex: number): string {
    return (stepIndex + 1).toString();
  }

  onTutorialNavigationRequest = (request: ITutorialNavigationRequest) => {
    this.navService.navigate({
      route: Routes.tutorialSpecified.build({
        tutorialId: request.tutorialId,
        stepIndex: this.formatStepIndexToParam(request.stepIndex)
      })
    });
  };

  onTutorialLoaded = (tutorial: ITutorialLoadedData) => {
    /**Nothing here yet */
  };

  onFixTheCodeRequest = (code: string) => {
    this.executionService.updateCode(code, "external");
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content">
          {this.state.userSettings &&
          this.state.theme &&
          this.state.pageLayoutConfig && [
            <GoldenLayoutComponent
              key={this.state.layoutReRenderIncrement}
              layoutConfig={this.state.pageLayoutConfig}
              onLayoutChange={this.layoutChangeSubject}
              panels={[
                as<IPanelConfig<TutorialViewComponent, ITutorialViewComponentProps>>({
                  title: _T("Tutorial"),
                  componentName: "tutorial-panel",
                  componentType: TutorialViewComponent,
                  props: {
                    tutorialLoadRequest: this.tutorialLoadRequest,
                    tutorialLoadedStream: this.tutorialLoadedStream,
                    tutorialNavigationStream: this.tutorialNavigationStream,
                    fixTheCodeStream: this.fixTheCodeStream
                  }
                }),
                as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                  title: _T("Code"),
                  componentName: "code-panel",
                  componentType: CodePanelComponent,
                  props: {
                    editorTheme: this.state.theme.codeEditorThemeName,
                    executionService: this.executionService,
                    program: new ProgramModel("", undefined, "tutorial", "logo", "", ""),
                    saveCurrentEnabled: false,
                    navigateAutomaticallyAfterSaveAs: false
                  }
                }),
                as<IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>>({
                  title: "Output",
                  componentName: "output-panel",
                  componentType: OutputPanelComponent,
                  props: {
                    logoExecutorProps: {
                      height: 300,
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
          ]}
        </div>
      </div>
    );
  }
}
