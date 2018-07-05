import * as React from "react";
import { Subject } from "rxjs/Subject";

import { callActionSafe } from "app/utils/error-helpers";

import { checkIsMobileDevice } from "app/utils/device-helper";
import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { ErrorService } from "app/services/infrastructure/error.service";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { ThemesService, Theme } from "app/services/customizations/themes.service";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { LogoCodeSamplesService } from "app/services/program/logo-code-samples.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { ReactGoldenLayout } from "app/ui/_generic/react-golden-layout/react-golden-layout";
import { ReactGoldenLayoutPanel } from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { CodePanelComponent } from "app/ui/code-panel/code-panel.component";
import { OutputPanelComponent } from "app/ui/output-panel/output-panel.component";
import {
  playgroundDefaultLayout,
  playgroundDefaultMobileLayout
} from "app/ui/playground/playground-default-goldenlayout";

import "./playground.page.component.less";

interface IComponentState {
  isLoading: boolean;

  programId?: string;
  storageType?: ProgramStorageType;
  programName: string;
  programCode: string;
  hasChanges: boolean;

  userSettings?: IUserSettings;
  turtleImage?: HTMLImageElement;
  theme?: Theme;
  codePanelTitle: string;
  layoutLocalStorageKey?: string;
}

export interface IComponentProps {
  storageType: ProgramStorageType;
  programId?: string;
}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
  private navigationService = resolveInject(NavigationService);
  private errorService = resolveInject(ErrorService);
  private titleService = resolveInject(TitleService);
  private programManagementService = resolveInject(ProgramManagementService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themesService = resolveInject(ThemesService);
  private turtlesService = resolveInject(TurtlesService);
  private eventsTracking = resolveInject(EventsTrackingService);
  private demoSamplesService = resolveInject(LogoCodeSamplesService);
  private executionContext = new ProgramExecutionContext();
  private resizeEventsSubject = new Subject<void>();
  private isMobileDevice = checkIsMobileDevice();

  private defaultLayoutConfigJSON = JSON.stringify(
    this.isMobileDevice ? playgroundDefaultMobileLayout : playgroundDefaultLayout
  );

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      programCode: "",
      hasChanges: false,
      programName: "",
      codePanelTitle: ""
    };
  }

  async componentWillReceiveProps(newProps: IComponentProps) {
    if (this.state.programId === newProps.programId) {
      /* Skip reload of data if we already have that program loaded.
         Happens when we do navigation after "SaveAs" command in order to update browser URL */
      return;
    }
    if (newProps.programId != this.props.programId) {
      this.setState({ isLoading: true });
      await this.loadData(newProps);
    }
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.program.playgroundTitle);
    await this.loadData(this.props);
  }

  private setProgramToState(program: ProgramModel) {
    this.setState({
      programCode: program.code,
      programId: program.id,
      programName: program.name,
      storageType: program.storageType,
      hasChanges: program.hasTempLocalModifications,
      codePanelTitle: this.buildCodePanelTitle(program.name, program.id, program.hasTempLocalModifications)
    });
  }

  private onSaveAs = (program: ProgramModel) => {
    this.setProgramToState(program);
    this.navigationService.navigate({
      route: Routes.codeLibrary.build({
        id: program.id
      })
    });
  };

  private buildCodePanelTitle(programName: string, programId: string | undefined, hasChanges: boolean): string {
    let title = `<i class="fa fa-code" aria-hidden="true"></i> `;
    if (!programId) {
      title += $T.program.codePanelTitle;
    } else {
      title += `${$T.program.program}: <strong>${programName}</strong>`;
      if (hasChanges) {
        title += ` <i class="fa fa-asterisk icon-sm" aria-hidden="true" title="${$T.program.programHasChanges}"></i>`;
      }
    }
    return title;
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

    this.setProgramToState(programModel);
    this.setState({
      isLoading: false,
      userSettings,
      theme,
      turtleImage,
      layoutLocalStorageKey:
        this.userSettingsService.userSettingsKey + ":playground-layout" + (this.isMobileDevice ? "-mobile" : "-desktop")
    });

    this.titleService.setDocumentTitle(programModel.name);

    setTimeout(() => {
      this.executionContext.executeProgram(programModel.code);
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
          {this.state.userSettings &&
            this.state.theme && (
              <ReactGoldenLayout
                className="golden-layout-container"
                configLayoutOverride={{
                  settings: {
                    showMaximiseIcon: false,
                    showPopoutIcon: false,
                    showCloseIcon: false
                  },
                  dimensions: { headerHeight: 32 }
                }}
                layoutLocalStorageKey={this.state.layoutLocalStorageKey}
                defaultLayoutConfigJSON={this.defaultLayoutConfigJSON}
                onLayoutChange={() => this.resizeEventsSubject.next()}
              >
                <ReactGoldenLayoutPanel id="code-panel" title={this.state.codePanelTitle}>
                  <CodePanelComponent
                    programId={this.state.programId}
                    storageType={this.state.storageType}
                    programName={this.state.programName}
                    programCode={this.state.programCode}
                    hasChanges={this.state.hasChanges}
                    executionContext={this.executionContext}
                    onCodeChange={newCode => this.setState({ programCode: newCode })}
                    editorTheme={this.state.theme.codeEditorThemeName}
                    onSaveAs={this.onSaveAs}
                    resizeEvents={this.resizeEventsSubject}
                    onHasChangesChange={hasChanges => {
                      const codePanelTitle = this.buildCodePanelTitle(
                        this.state.programName,
                        this.state.programId,
                        hasChanges
                      );
                      this.setState({ codePanelTitle, hasChanges });
                    }}
                  />
                </ReactGoldenLayoutPanel>
                <ReactGoldenLayoutPanel
                  id="output-panel"
                  title={`<i class="fa fa-television" aria-hidden="true"></i> ` + $T.program.outputPanelTitle}
                >
                  <OutputPanelComponent
                    executionContext={this.executionContext}
                    isDarkTheme={this.state.theme.isDark}
                    turtleImage={this.state.turtleImage}
                    turtleSize={this.state.userSettings.turtleSize}
                  />
                </ReactGoldenLayoutPanel>
              </ReactGoldenLayout>
            )}
        </div>
      </div>
    );
  }
}
