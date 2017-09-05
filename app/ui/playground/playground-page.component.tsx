import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { as } from "app/utils/syntax-helpers";
import { callActionSafe } from "app/utils/async-helpers";
import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutComponent, IPanelConfig, GoldenLayoutConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import {
  ProgramsLocalStorageRepository,
  IProgramsRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";

import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";

import "./playground-page.component.scss";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  layoutReRenderIncrement: number;
  pageLayoutConfig?: GoldenLayoutConfig;
  program?: ProgramModel;
  turtleImage?: HTMLImageElement;
  theme?: Theme;
}

export interface IPlaygroundPageRouteParams {
  storageType: ProgramStorageType;
  programId?: string;
}

export { ProgramStorageType };

interface IComponentProps extends RouteComponentProps<IPlaygroundPageRouteParams> {}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(INotificationService) private notificationService: INotificationService;
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(ProgramsLocalStorageRepository) private programsRepo: IProgramsRepository;
  @lazyInject(ProgramsSamplesRepository) private programSamples: IProgramsRepository;
  @lazyInject(IUserSettingsService) private userSettingsService: IUserSettingsService;
  @lazyInject(ThemesService) private themesService: ThemesService;
  @lazyInject(TurtlesService) private turtlesService: TurtlesService;
  private executionService = new ProgramExecutionService();
  private managementService = new ProgramManagementService(
    this.programSamples,
    this.programsRepo,
    this.executionService
  );

  private errorHandler = (err: string) => {
    this.notificationService.push({ message: err, type: "danger" });
    this.setState({ isLoading: false });
  };

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

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Playground"));
    await this.loadData(this.props);
    this.executionService.initHotkeys();
    this.subscriptions.push(this.layoutChangeSubject.subscribe(this.layoutChanged));
  }

  componentWillUnmount() {
    this.executionService.disposeHotkeys();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  layoutChanged = async (newLayout: GoldenLayoutConfig): Promise<void> => {
    this.setState({ pageLayoutConfig: newLayout });
    await this.userSettingsService.update({
      playgroundLayoutJSON: JSON.stringify(newLayout)
    });
  };

  async loadData(props: IComponentProps) {
    this.setState({ isLoading: true });

    const userSettings = await callActionSafe(this.errorHandler, async () => this.userSettingsService.get());
    if (!userSettings) {
      return;
    }

    let layoutConfig = this.defaultLayoutConfig;
    if (!this.state.pageLayoutConfig) {
      try {
        layoutConfig = JSON.parse(userSettings.playgroundLayoutJSON || "");
      } catch (ex) {
        /*nothing*/
      }
    }

    const programId = props.match.params.programId;
    const storageType = props.match.params.storageType;
    const programModel = await callActionSafe(this.errorHandler, async () =>
      this.managementService.loadProgram(storageType, programId)
    );
    if (!programModel) {
      return;
    }

    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);

    this.executionService.setProgram(programModel.id, programModel.name, programModel.code);
    this.setState({
      isLoading: false,
      program: programModel,
      userSettings,
      theme,
      turtleImage,
      pageLayoutConfig: layoutConfig,
      layoutReRenderIncrement: this.state.layoutReRenderIncrement + 1
    });

    this.titleService.setDocumentTitle(programModel.name);
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content">
          {this.state.program &&
          this.state.userSettings &&
          this.state.theme &&
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
                    isFromGallery: this.props.match.params.storageType === ProgramStorageType.gallery,
                    program: this.state.program,
                    editorTheme: this.state.theme.codeEditorThemeName,
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
