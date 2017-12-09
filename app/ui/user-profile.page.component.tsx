import * as React from "react";
import * as cn from "classnames";
import * as FileSaver from "file-saver";
import { Link, RouteComponentProps } from "react-router-dom";
import { Subject, BehaviorSubject } from "rxjs";

import { stay } from "app/utils/async-helpers";
import { RandomHelper } from "app/utils/random-helper";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";

import { DateTimeStampComponent } from "app/ui/_generic/date-time-stamp.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";
import { MainMenuComponent } from "app/ui/main-menu.component";
import { LogoExecutorComponent } from "app/ui/_shared/logo-executor.component";
import { FileSelectorComponent } from "app/ui/_generic/file-selector.component";

import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { UserInfo } from "app/services/login/user-info";
import { TurtlesService } from "app/services/customizations/turtles.service";
import { Theme, ThemesService } from "app/services/customizations/themes.service";
import { ProgramsExportImportService } from "app/services/gallery/programs-export-import.service";
import { LocalizationService, ILocaleInfo, _T } from "app/services/customizations/localization.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { IUserLibraryRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";

interface IComponentState {
  userInfo: UserInfo;
  isSavingInProgress: boolean;
  isImportingInProgress?: boolean;
  programCount: number;
  currentLocale?: ILocaleInfo;
  theme?: Theme;
  userSettings?: IUserSettings;
  turtleImage?: HTMLImageElement;
}

interface IComponentProps extends RouteComponentProps<void> {}

const codeSamples = [
  "pu setxy -40 -20 pd repeat 8 [fd 40 rt 360/8]",
  "repeat 10 [repeat 8 [fd 20 rt 360/8] rt 360/10]",
  "repeat 14 [fd repcount*8 rt 90]",
  "window repeat 10 [fd 5 * repcount repeat 3 [fd 18 rt 360/3] rt 360/10]",
  "pu setxy -20 -20 pd repeat 8 [rt 45 repeat 4 [repeat 90 [fd 1 rt 2] rt 90]]",
  "repeat 10 [fd 10 rt 90 fd 10 lt 90]"
];

export class UserProfilePageComponent extends React.Component<IComponentProps, IComponentState> {
  private titleService = resolveInject(TitleService);
  private navService = resolveInject(INavigationService);
  private notificationService = resolveInject(INotificationService);
  private currentUser = resolveInject(ICurrentUserService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themeService = resolveInject(ThemesService);
  private turtleCustomizationService = resolveInject(TurtlesService);
  private localizationService = resolveInject(LocalizationService);
  private programsReporitory = resolveInject(IUserLibraryRepository);

  private onIsRunningChanged = new Subject<boolean>();
  private runCode = new BehaviorSubject<string>("");
  private exportInportService = new ProgramsExportImportService();

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
  };

  constructor(props: IComponentProps) {
    super(props);
    const loginStatus = this.currentUser.getLoginStatus();

    this.state = {
      userInfo: loginStatus.userInfo,
      isSavingInProgress: false,
      programCount: 0
    };
    this.setRandomCode();
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("User profile"));
    await this.loadData();
  }

  private setRandomCode() {
    this.runCode.next(codeSamples[RandomHelper.getRandomInt(0, codeSamples.length - 1)]);
  }

  private async loadData() {
    const [programs, userSettings] = await Promise.all([
      callActionSafe(this.errorHandler, async () => this.programsReporitory.getAll()),
      callActionSafe(this.errorHandler, async () => this.userSettingsService.get())
    ]);
    if (programs && userSettings) {
      const theme = this.themeService.getTheme(userSettings.themeName);
      const locale = this.localizationService.getLocaleById(userSettings.localeId);
      const turtleImage = this.turtleCustomizationService.getTurtleImage(userSettings.turtleId);

      this.setState({
        userSettings: userSettings,
        theme: theme,
        currentLocale: locale,
        turtleImage: turtleImage,
        programCount: programs.length
      });
    }
  }

  private doExport = async () => {
    const programs = await callActionSafe(this.errorHandler, async () =>
      this.exportInportService.exportAll(this.programsReporitory)
    );
    if (programs) {
      const html = new ProgramsHtmlSerializerService().serialize(programs);
      const blob = new Blob([html], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, `my-logo-programs.html`);
    }
  };

  private onImport = async (fileInfo: File, content: string) => {
    this.setState({ isImportingInProgress: true });
    const added = await callActionSafe(this.errorHandler, async () => {
      const programs = new ProgramsHtmlSerializerService().parse(content);
      return this.exportInportService.importAll(this.programsReporitory, programs);
    });
    this.setState({ isImportingInProgress: false });
    if (added !== undefined) {
      await this.loadData();
      this.notificationService.push({
        type: "success",
        title: _T("Import completed"),
        message: _T("Added programs: %d", { value: added }),
        closeTimeout: 4000
      });
    }
  };

  render(): JSX.Element {
    return (
      <div>
        <MainMenuComponent />
        <div className="container">
          <br />
          <PageHeaderComponent title={_T("User settings")} />

          {this.state.userSettings &&
            this.state.currentLocale &&
            this.state.theme &&
            this.state.userInfo && (
              <div className="tile is-ancestor">
                <div className="tile is-6 is-vertical is-parent">
                  <div className="tile is-child box">
                    <p>
                      <strong>{_T("Name")}:</strong> {this.state.userInfo.attributes.name}
                    </p>
                    <p>
                      <strong>{_T("Email")}:</strong> {this.state.userInfo.attributes.email}
                    </p>
                  </div>
                  <div className="tile is-child box">
                    <div className="field">
                      <label className="label">{_T("Language")}</label>
                      <div className="control">
                        <div className="select">
                          <select
                            id="localeselector"
                            value={this.state.currentLocale.id}
                            onChange={event => {
                              const selectedLocation = this.localizationService
                                .getSupportedLocales()
                                .find(loc => loc.id === event.target.value);
                              if (selectedLocation) {
                                setTimeout(async () => {
                                  await this.userSettingsService.update({ localeId: selectedLocation.id });
                                  // refresh browser window
                                  window.location.reload(true);
                                }, 0);
                              }
                              return {};
                            }}
                          >
                            {this.localizationService.getSupportedLocales().map(loc => {
                              return (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">{_T("User interface theme")}</label>
                      <div className="control">
                        <div className="select">
                          <select
                            id="themeselector"
                            value={this.state.theme.name}
                            onChange={event => {
                              const selectedTheme = this.themeService
                                .getAllThemes()
                                .find(t => t.name === event.target.value);
                              if (selectedTheme) {
                                setTimeout(async () => {
                                  await this.userSettingsService.update({ themeName: selectedTheme.name });
                                  window.localStorage.setItem(
                                    (window as any).appThemeNameLocalStorageKey,
                                    JSON.stringify(selectedTheme)
                                  );
                                  // refresh browser window
                                  window.location.reload(true);
                                }, 0);
                              }
                              return {};
                            }}
                          >
                            {this.themeService.getAllThemes().map(t => {
                              return (
                                <option key={t.name} value={t.name}>
                                  {t.name} - {t.description}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    <label className="label">{_T("Turtle")}</label>
                    <div className="field is-grouped">
                      <div className="control">
                        <div className="select">
                          <select
                            id="turtleSelector"
                            value={this.state.userSettings.turtleId}
                            onChange={async event => {
                              const value = event.target.value;
                              await this.userSettingsService.update({ turtleId: value });
                              await this.loadData();
                              this.setRandomCode();
                            }}
                          >
                            {this.turtleCustomizationService.getAllTurtles().map(t => {
                              return (
                                <option key={t.id} value={t.id}>
                                  {t.getName()}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="control">
                        <div className="select">
                          <select
                            id="turtleSelector"
                            value={this.state.userSettings.turtleSize}
                            onChange={async event => {
                              const value = parseInt(event.target.value, 10);
                              await this.userSettingsService.update({ turtleSize: value });
                              await this.loadData();
                              this.setRandomCode();
                            }}
                          >
                            <option value={20}>{_T("Extra Small")}</option>
                            <option value={32}>{_T("Small")}</option>
                            <option value={40}>{_T("Medium")}</option>
                            <option value={52}>{_T("Large")}</option>
                            <option value={72}>{_T("Huge")}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <label className="label">{_T("Personal library")}</label>
                    <p className="help">
                      <span>
                        {_T("You have %d program", {
                          plural: "You have %d programs",
                          value: this.state.programCount
                        })}
                      </span>
                    </p>
                    <div className="field is-grouped is-grouped-multiline">
                      <p className="control">
                        <a className="button" onClick={this.doExport}>
                          {_T("Export")}
                        </a>
                      </p>
                      <p className="control">
                        <FileSelectorComponent
                          className={cn({ "is-loading": this.state.isImportingInProgress })}
                          buttonText={_T("Import")}
                          onFileTextContentReady={this.onImport}
                        />
                      </p>
                    </div>
                  </div>
                </div>
                <div className="tile is-parent">
                  <div className="tile is-child box">
                    {[
                      <LogoExecutorComponent
                        key={`${JSON.stringify(this.state.userSettings)}`} //this is a hack to force component to be created each render in order to not handle prop change event
                        onIsRunningChanged={this.onIsRunningChanged}
                        runCommands={this.runCode}
                        stopCommands={new Subject<void>()}
                        customTurtleImage={this.state.turtleImage}
                        customTurtleSize={this.state.userSettings.turtleSize}
                        isDarkTheme={this.state.theme.isDark}
                      />
                    ]}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}
