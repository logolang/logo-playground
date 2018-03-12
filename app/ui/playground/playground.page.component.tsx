import * as React from "react";
import { Subject, BehaviorSubject } from "rxjs";

import { as } from "app/utils/syntax-helpers";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutComponent, IPanelConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import {
  playgroundDefaultLayout,
  playgroundDefaultMobileLayout
} from "app/ui/playground/playground-default-goldenlayout";
import { checkIsMobileDevice } from "app/utils/device-helper";

import "./playground.page.component.less";

interface IComponentState {
  isLoading: boolean;
  userSettings?: IUserSettings;
  pageLayoutConfig?: object;
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

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(INotificationService);
  private navigationService = resolveInject(INavigationService);
  private titleService = resolveInject(TitleService);
  private programManagementService = resolveInject(ProgramManagementService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private eventsTracking = resolveInject(IEventsTrackingService);
  private executionService = new ProgramExecutionContext();
  private layoutChangedSubject = new Subject<void>();
  private codePanelTitle = new BehaviorSubject<string>("");
  private outputPanelTitle = new BehaviorSubject<string>("");
  private isMobileDevice = checkIsMobileDevice();
  private defaultLayoutConfig = this.isMobileDevice ? playgroundDefaultMobileLayout : playgroundDefaultLayout;

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
    this.setState({ isLoading: false });
  };

  constructor(props: IComponentProps) {
    super(props);
    this.state = this.buildDefaultState(this.props);
  }

  buildDefaultState(props: IComponentProps): IComponentState {
    const state: IComponentState = {
      isLoading: true
    };
    return state;
  }

  async componentWillReceiveProps(newProps: IComponentProps) {
    if (newProps.programId != this.props.programId) {
      this.setState({ isLoading: true });
      await this.loadData(newProps);
    }
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Playground"));
    await this.loadData(this.props);
  }

  componentWillUnmount() {
    /***/
  }

  layoutChanged = async (newLayout: object): Promise<void> => {
    await this.userSettingsService.update(
      this.isMobileDevice
        ? {
            playgroundLayoutMobile: newLayout
          }
        : {
            playgroundLayout: newLayout
          }
    );
    this.layoutChangedSubject.next();
  };

  private onSaveAs = (program: ProgramModel) => {
    this.setCodePanelTitle(program.name, program.id, program.hasTempLocalModifications);
    this.setState({
      program: program
    });
    this.navigationService.navigate({
      route: Routes.codeLibrary.build({
        id: program.id
      })
    });
  };

  private setCodePanelTitle(programName: string, programId: string, hasChanges: boolean) {
    let title =
      `<i class="fa fa-code" aria-hidden="true"></i> ` +
      _T("Program") +
      (programName ? ": <strong>" + programName + "</strong>" : "");
    if (hasChanges && programId) {
      title += ` <i class="fa fa-asterisk" aria-hidden="true" style="transform: scale(0.7, 0.7);" title="${_T(
        "This program has changes"
      )}"></i>`;
    }
    this.codePanelTitle.next(title);
  }

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
        this.eventsTracking.sendEvent(EventAction.openProgramFromSharedGist);
        break;
      case ProgramStorageType.gallery:
        this.eventsTracking.sendEvent(EventAction.openProgramFromPersonalLibrary);
        break;
      case undefined:
        this.eventsTracking.sendEvent(EventAction.openPlayground);
        break;
    }

    const theme = this.themesService.getTheme(userSettings.themeName);
    const turtleImage = this.turtlesService.getTurtleImage(userSettings.turtleId);

    this.setCodePanelTitle(programModel.name, programModel.id, programModel.hasTempLocalModifications);
    this.outputPanelTitle.next(`<i class="fa fa-television" aria-hidden="true"></i> ` + _T("Output"));

    this.setState({
      isLoading: false,
      program: programModel,
      userSettings,
      theme,
      turtleImage,
      pageLayoutConfig: this.isMobileDevice ? userSettings.playgroundLayoutMobile : userSettings.playgroundLayout
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
        <div className="ex-page-content playground-page-component">
          {this.state.isLoading && (
            <div className="main-loading-container">
              <LoadingComponent isLoading />
            </div>
          )}
          {this.state.program &&
            this.state.userSettings &&
            this.state.theme && (
              <GoldenLayoutComponent
                initialLayoutConfig={this.state.pageLayoutConfig}
                defaultLayoutConfig={this.defaultLayoutConfig}
                onLayoutChange={this.layoutChanged}
                panelsReloadCheck={(oldPanels, newPanels) => {
                  const oldProgramId = oldPanels[0].props.program.id;
                  const newProgramId = newPanels[0].props.program.id;
                  return newProgramId !== oldProgramId;
                }}
                panels={[
                  as<IPanelConfig<CodePanelComponent, ICodePanelComponentProps>>({
                    title: this.codePanelTitle,
                    componentName: "code-panel",
                    componentType: CodePanelComponent,
                    props: {
                      saveCurrentEnabled: this.props.storageType === ProgramStorageType.gallery,
                      program: this.state.program,
                      editorTheme: this.state.theme.codeEditorThemeName,
                      executionService: this.executionService,
                      onSaveAs: this.onSaveAs,
                      containerResized: this.layoutChangedSubject,
                      hasChangesStatus: hasChanges =>
                        this.setCodePanelTitle(this.state.program!.name, this.state.program!.id, hasChanges)
                    }
                  }),
                  as<IPanelConfig<OutputPanelComponent, IOutputPanelComponentProps>>({
                    title: this.outputPanelTitle,
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
