import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { as } from "app/utils/syntax-helpers";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";
import { subscribeLoadDataOnPropsParamsChange, subscribeLoadDataOnPropsChange } from "app/utils/react-helpers";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";
import {
  IEventsTrackingService,
  EventCategory,
  EventAction
} from "app/services/infrastructure/events-tracking.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutComponent, IPanelConfig, GoldenLayoutConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import "./playground.page.component.scss";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  pageLayoutConfigJSON?: string;
  program?: ProgramModel;
  turtleImage?: HTMLImageElement;
  theme?: Theme;
}

export interface IComponentProps {
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

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(INotificationService);
  private titleService = resolveInject(TitleService);
  private programManagementService = resolveInject(ProgramManagementService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private eventsTracking = resolveInject(IEventsTrackingService);
  private executionService = new ProgramExecutionContext();
  private layoutChangedSubject = new Subject<void>();

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
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
    subscribeLoadDataOnPropsChange(this);
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
  }

  componentWillUnmount() {
    /***/
  }

  layoutChanged = async (newLayoutJSON: string): Promise<void> => {
    await this.userSettingsService.update({
      playgroundLayoutJSON: newLayoutJSON
    });
    this.layoutChangedSubject.next();
  };

  async loadData(props: IComponentProps) {
    this.setState({ isLoading: true });

    const userSettings = await callActionSafe(this.errorHandler, async () => this.userSettingsService.get());
    if (!userSettings) {
      return;
    }

    const programId = props.programId;
    const storageType = props.storageType;
    const programModel = await callActionSafe(this.errorHandler, async () =>
      this.programManagementService.loadProgram(programId, storageType)
    );
    if (!programModel) {
      return;
    }

    if (!programModel.code) {
      programModel.code = defaultPlaygroundProgram;
    }

    switch (programModel.storageType) {
      case ProgramStorageType.gist:
        this.eventsTracking.sendEvent({ category: EventCategory.gist, action: EventAction.gistProgramOpen });
        break;
      case ProgramStorageType.gallery:
        this.eventsTracking.sendEvent({
          category: EventCategory.personalLibrary,
          action: EventAction.galleryProgramOpen
        });
        break;
    }

    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);

    this.setState({
      isLoading: false,
      program: programModel,
      userSettings,
      theme,
      turtleImage,
      pageLayoutConfigJSON: userSettings.playgroundLayoutJSON
    });

    this.titleService.setDocumentTitle(programModel.name);

    if (programModel.storageType) {
      setTimeout(() => {
        this.executionService.executeProgram(programModel.code);
      }, 500);
    }
  }

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
          {this.state.program &&
            this.state.userSettings &&
            this.state.theme && (
              <GoldenLayoutComponent
                initialLayoutConfigJSON={this.state.pageLayoutConfigJSON || ""}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={this.layoutChanged}
                panelsReloadCheck={(oldPanels, newPanels) => {
                  return oldPanels[0].props.program.id !== newPanels[0].props.program.id;
                }}
                panels={[
                  as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                    title:
                      `<i class="fa fa-code" aria-hidden="true"></i> ` + (this.state.program.name || _T("Playground")),
                    componentName: "code-panel",
                    componentType: CodePanelComponent,
                    props: {
                      saveCurrentEnabled: this.props.storageType === ProgramStorageType.gallery,
                      program: this.state.program,
                      editorTheme: this.state.theme.codeEditorThemeName,
                      executionService: this.executionService,
                      navigateAutomaticallyAfterSaveAs: true,
                      containerResized: this.layoutChangedSubject
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
