import * as React from "react";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { as } from "app/utils/syntax-helpers";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";

import { checkIsMobileDevice } from "app/utils/device-helper";
import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { ErrorService } from "app/services/infrastructure/error.service";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { LogoCodeSamplesService } from "app/services/program/logo-code-samples.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { GoldenLayoutComponent, IPanelConfig } from "app/ui/_shared/golden-layout.component";
import { CodePanelComponent, ICodePanelComponentProps } from "app/ui/playground/code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "app/ui/playground/output-panel.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import {
  playgroundDefaultLayout,
  playgroundDefaultMobileLayout
} from "app/ui/playground/playground-default-goldenlayout";

import "./playground.page.component.less";

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

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(NotificationService);
  private navigationService = resolveInject(NavigationService);

  private errorService = resolveInject(ErrorService);
  private titleService = resolveInject(TitleService);
  private programManagementService = resolveInject(ProgramManagementService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private eventsTracking = resolveInject(EventsTrackingService);
  private demoSamplesService = resolveInject(LogoCodeSamplesService);
  private executionService = new ProgramExecutionContext();
  private layoutChangedSubject = new Subject<void>();
  private codePanelTitle = new BehaviorSubject<string>("");
  private outputPanelTitle = new BehaviorSubject<string>("");
  private isMobileDevice = checkIsMobileDevice();
  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? playgroundDefaultMobileLayout : playgroundDefaultLayout
  );

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
    this.titleService.setDocumentTitle($T.program.playgroundTitle);
    await this.loadData(this.props);
  }

  componentWillUnmount() {
    /***/
  }

  layoutChanged = async (newLayoutJSON: string): Promise<void> => {
    await this.userSettingsService.update(
      this.isMobileDevice
        ? {
            playgroundLayoutMobileJSON: newLayoutJSON
          }
        : {
            playgroundLayoutJSON: newLayoutJSON
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
      $T.program.program +
      (programName ? ": <strong>" + programName + "</strong>" : "");
    if (hasChanges && programId) {
      title += ` <i class="fa fa-asterisk icon-sm" aria-hidden="true" title="${$T.program.programHasChanges}"></i>`;
    }
    this.codePanelTitle.next(title);
  }

  async loadData(props: IComponentProps) {
    this.setState({ isLoading: true });

    const userSettings = await callActionSafe(this.errorService.handleError, async () =>
      this.userSettingsService.get()
    );
    if (!userSettings) {
      this.setState({ isLoading: false });
      return;
    }

    const programId = props.programId;
    const storageType = props.storageType;
    const programModel = await callActionSafe(this.errorService.handleError, async () =>
      this.programManagementService.loadProgram(programId, storageType)
    );
    if (!programModel) {
      this.setState({ isLoading: false });
      return;
    }

    if (!programModel.code) {
      programModel.code =
        "; " + $T.program.defaultProgramWelcomeComment + "\r\n" + this.demoSamplesService.getRandomSample();
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
    this.outputPanelTitle.next(`<i class="fa fa-television" aria-hidden="true"></i> ` + $T.program.output);

    this.setState({
      isLoading: false,
      program: programModel,
      userSettings,
      theme,
      turtleImage,
      pageLayoutConfigJSON: this.isMobileDevice
        ? userSettings.playgroundLayoutMobileJSON
        : userSettings.playgroundLayoutJSON
    });

    this.titleService.setDocumentTitle(programModel.name);

    setTimeout(() => {
      this.executionService.executeProgram(programModel.code);
    }, 500);
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
                initialLayoutConfigJSON={this.state.pageLayoutConfigJSON}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
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
