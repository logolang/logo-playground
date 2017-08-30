import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject, Subscription } from "rxjs";

import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";
import { callActionSafe } from "app/utils/async-helpers";
import { as } from "app/utils/syntax-helpers";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import {
  UserCustomizationsProvider,
  IUserCustomizationsData
} from "app/services/customizations/user-customizations-provider";

import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { IUserDataService } from "app/services/customizations/user-data.service";

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

interface IComponentState {
  isLoading: boolean;
  layoutReRenderIncrement: number;
  pageLayoutConfig?: GoldenLayoutConfig;
  userCustomizations?: IUserCustomizationsData;
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
  @lazyInject(IUserDataService) private userDataService: IUserDataService;
  @lazyInject(UserCustomizationsProvider) private userCustomizationsProvider: UserCustomizationsProvider;

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
    const userCustomizations = await callActionSafe(this.errorHandler, async () =>
      this.userCustomizationsProvider.getCustomizationsData()
    );
    if (!userCustomizations) {
      return;
    }

    const layoutConfig = this.defaultLayoutConfig;

    const lastTutorialInfo = await callActionSafe(this.errorHandler, async () =>
      this.userDataService.getCurrentTutorialInfo()
    );
    if (!lastTutorialInfo) {
      return;
    }
    const initialCode = lastTutorialInfo.code;

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
      userCustomizations: userCustomizations
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
          {this.state.userCustomizations &&
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
                    editorTheme: this.state.userCustomizations.codeEditorTheme,
                    executionService: this.executionService,
                    managementService: {} as any //this.managementService
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
                      isDarkTheme: this.state.userCustomizations.isDark,
                      customTurtleImage: this.state.userCustomizations.turtleImage,
                      customTurtleSize: this.state.userCustomizations.turtleSize
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
