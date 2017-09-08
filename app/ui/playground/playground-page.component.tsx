import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { as } from "app/utils/syntax-helpers";
import { callActionSafe } from "app/utils/async-helpers";
import { subscribeLoadDataOnPropsParamsChange } from "app/utils/react-helpers";

import { MainMenuComponent } from "app/ui/main-menu.component";
import {
  GoldenLayoutComponent,
  IPanelConfig,
  GoldenLayoutConfig
} from "app/ui/_shared/golden-layout.component";
import {
  CodePanelComponent,
  ICodePanelComponentProps
} from "app/ui/playground/code-panel.component";
import {
  OutputPanelComponent,
  IOutputPanelComponentProps
} from "app/ui/playground/output-panel.component";

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
import {
  IUserSettingsService,
  IUserSettings
} from "app/services/customizations/user-settings.service";

import {
  ProgramStorageType,
  ProgramManagementService
} from "app/services/program/program-management.service";

import "./playground-page.component.scss";
import {
  ThemesService,
  Theme
} from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  pageLayoutConfigJSON?: string;
  program?: ProgramModel;
  turtleImage?: HTMLImageElement;
  theme?: Theme;
}

export interface IPlaygroundPageRouteParams {
  storageType: ProgramStorageType;
  programId?: string;
}

const defaultPlaygroundProgram = `;This is LOGO program sample
forward 50
right 90
forward 100
arc 360 50
`;

export { ProgramStorageType };

interface IComponentProps
  extends RouteComponentProps<IPlaygroundPageRouteParams> {}

export class PlaygroundPageComponent extends React.Component<
  IComponentProps,
  IComponentState
> {
  @lazyInject(INotificationService)
  private notificationService: INotificationService;
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(ProgramManagementService)
  private programManagementService: ProgramManagementService;
  @lazyInject(IUserSettingsService)
  private userSettingsService: IUserSettingsService;
  @lazyInject(ThemesService) private themesService: ThemesService;
  @lazyInject(TurtlesService) private turtlesService: TurtlesService;
  private executionService = new ProgramExecutionService();

  private errorHandler = (err: string) => {
    this.notificationService.push({ message: err, type: "danger" });
    this.setState({ isLoading: false });
  };

  private defaultLayoutConfigJSON = JSON.stringify({
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
  });

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
    this.titleService.setDocumentTitle(_T("Playground"));
    await this.loadData(this.props);
    this.executionService.initHotkeys();
  }

  componentWillUnmount() {
    this.executionService.disposeHotkeys();
  }

  layoutChanged = async (newLayoutJSON: string): Promise<void> => {
    await this.userSettingsService.update({
      playgroundLayoutJSON: newLayoutJSON
    });
  };

  async loadData(props: IComponentProps) {
    this.setState({ isLoading: true });

    const userSettings = await callActionSafe(this.errorHandler, async () =>
      this.userSettingsService.get()
    );
    if (!userSettings) {
      return;
    }

    const programId = props.match.params.programId;
    const storageType = props.match.params.storageType;
    const programModel = await callActionSafe(this.errorHandler, async () =>
      this.programManagementService.loadProgram(programId, storageType)
    );
    if (!programModel) {
      return;
    }

    if (!programModel.code) {
      programModel.code = defaultPlaygroundProgram;
    }

    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(
      userSettings.turtleId
    );

    this.executionService.setProgram(programModel.code);
    this.setState({
      isLoading: false,
      program: programModel,
      userSettings,
      theme,
      turtleImage,
      pageLayoutConfigJSON: userSettings.playgroundLayoutJSON
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
          this.state.theme && (
            <GoldenLayoutComponent
              initialLayoutConfigJSON={this.state.pageLayoutConfigJSON || ""}
              defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
              onLayoutChange={this.layoutChanged}
              panelsReloadCheck={(oldPanels, newPanels) => {
                return (
                  oldPanels[0].props.program.id !==
                  newPanels[0].props.program.id
                );
              }}
              panels={[
                as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                  title: this.state.program.name || _T("Playground"),
                  componentName: "code-panel",
                  componentType: CodePanelComponent,
                  props: {
                    saveCurrentEnabled:
                      this.props.match.params.storageType ===
                      ProgramStorageType.gallery,
                    program: this.state.program,
                    editorTheme: this.state.theme.codeEditorThemeName,
                    executionService: this.executionService,
                    navigateAutomaticallyAfterSaveAs: true
                  }
                }),
                as<
                  IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>
                >({
                  title: "Output",
                  componentName: "output-panel",
                  componentType: OutputPanelComponent,
                  props: {
                    logoExecutorProps: {
                      height: 300,
                      runCommands: this.executionService.runCommands,
                      stopCommands: this.executionService.stopCommands,
                      makeScreenshotCommands: this.executionService
                        .makeScreenshotCommands,
                      onIsRunningChanged: this.executionService
                        .onIsRunningChanged,
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
