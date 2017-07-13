import * as React from "react";
import * as cn from "classnames";
import { LinkContainer } from "react-router-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { Subscription, Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { setupActionErrorHandler, callAction } from "app/utils/async-helpers";
import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutComponent, IPanelConfig, GoldenLayoutConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import {
  UserCustomizationsProvider,
  IUserCustomizationsData
} from "app/services/customizations/user-customizations-provider";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import {
  ProgramsLocalStorageRepository,
  IProgramsRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { IUserDataService } from "app/services/customizations/user-data.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";

import "./playground-page.component.scss";
import { as } from "app/utils/syntax-helpers";

interface IComponentState {
  isLoading: boolean;
  userCustomizations?: IUserCustomizationsData;
  layoutReRenderIncrement: number;
  pageLayoutConfig?: GoldenLayoutConfig;
  program?: ProgramModel;
}

export interface IPlaygroundPageRouteParams {
  storageType: ProgramStorageType;
  programId: string;
}

interface IComponentProps extends RouteComponentProps<IPlaygroundPageRouteParams> {}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(INotificationService) private notificationService: INotificationService;
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(ProgramsLocalStorageRepository) private programsRepo: IProgramsRepository;
  @lazyInject(ProgramsSamplesRepository) private programSamples: IProgramsRepository;
  @lazyInject(IUserDataService) private userDataService: IUserDataService;
  @lazyInject(UserCustomizationsProvider) private userCustomizationsProvider: UserCustomizationsProvider;
  @lazyInject(INavigationService) private navService: INavigationService;
  private executionService = new ProgramExecutionService();
  private managementService = new ProgramManagementService(
    this.programSamples,
    this.programsRepo,
    this.executionService,
    this.userDataService
  );

  private errorHandler = setupActionErrorHandler(error => {
    this.notificationService.push({ type: "danger", message: error });
  });

  private defaultLayoutConfig: GoldenLayoutConfig = {
    content: [
      {
        type: "row",
        content: [
          {
            title: "",
            type: "react-component",
            component: "output-panel",
            componentName: "output-panel",
            width: 60,
            isClosable: false
          },
          {
            title: "",
            type: "react-component",
            component: "code-panel",
            componentName: "code-panel",
            width: 40,
            isClosable: false
          }
        ]
      }
    ]
  };

  private layoutChangeSubject = new Subject<GoldenLayoutConfig>();
  private subscriptions: ISubscription[] = [];

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

  componentDidMount() {
    this.titleService.setDocumentTitle(_T("Playground"));
    this.loadData(this.props);
    this.executionService.initHotkeys();
    this.subscriptions.push(this.layoutChangeSubject.subscribe(this.layoutChanged));
  }

  componentWillUnmount() {
    this.executionService.disposeHotkeys();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  layoutChanged = (newLayout: GoldenLayoutConfig): void => {
    this.setState({ pageLayoutConfig: newLayout });
    this.userDataService.setPlaygroundLayoutJSON(JSON.stringify(newLayout));
  };

  async loadData(props: IComponentProps) {
    this.setState({ isLoading: true });

    const userCustomizations = await callAction(this.errorHandler, () =>
      this.userCustomizationsProvider.getCustomizationsData()
    );
    if (!userCustomizations) {
      return;
    }

    let layoutConfig = this.defaultLayoutConfig;
    if (!this.state.pageLayoutConfig) {
      const pageLayoutJSON = await callAction(this.errorHandler, () => this.userDataService.getPlaygroundLayoutJSON());
      try {
        layoutConfig = JSON.parse(pageLayoutJSON || "");
      } catch (ex) {}
    }

    const programId = props.match.params.programId;
    const storageType = props.match.params.storageType;
    const programModel = await this.managementService.loadProgram(programId || "", storageType);

    this.executionService.setProgram(programModel.id, programModel.name, storageType, programModel.code);
    this.setState({
      isLoading: false,
      program: programModel,
      userCustomizations: userCustomizations,
      pageLayoutConfig: layoutConfig,
      layoutReRenderIncrement: this.state.layoutReRenderIncrement + 1
    });

    this.titleService.setDocumentTitle(programModel.name);
  }

  render(): JSX.Element {
    return (
      <div>
        <MainMenuComponent />

        {this.state.program &&
        this.state.userCustomizations &&
        this.state.pageLayoutConfig && [
          <GoldenLayoutComponent
            key={this.state.layoutReRenderIncrement}
            layoutConfig={this.state.pageLayoutConfig}
            onLayoutChange={this.layoutChangeSubject}
            panels={[
              as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                title: this.state.program.name || _T("Playground"),
                componentName: "code-panel",
                componentType: CodePanelComponent,
                props: {
                  editorTheme: this.state.userCustomizations.codeEditorTheme,
                  executionService: this.executionService,
                  managementService: this.managementService
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
                    onError: () => {},
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
    );
  }
}
