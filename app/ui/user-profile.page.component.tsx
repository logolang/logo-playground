import * as React from "react";
import * as cn from "classnames";
import * as FileSaver from "file-saver";
import { RouteComponentProps } from "react-router-dom";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { RandomHelper } from "app/utils/random-helper";
import { callActionSafe, ErrorDef } from "app/utils/error-helpers";
import { ensure } from "app/utils/syntax-helpers";
import { resolveInject } from "app/di";
import { $T } from "app/i18n/strings";
import { UserInfo } from "app/services/login/user-info";
import { TurtlesService, TurtleInfo, TurtleSize } from "app/services/customizations/turtles.service";
import { Theme, ThemesService } from "app/services/customizations/themes.service";
import { PersonalGalleryImportService } from "app/services/gallery/personal-gallery-import.service";
import { LocalizationService, ILocaleInfo } from "app/services/customizations/localization.service";
import { CurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IUserSettingsService, IUserSettings } from "app/services/customizations/user-settings.service";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { DependecyInjectionSetupService } from "app/di-setup";
import { ErrorService } from "app/services/infrastructure/error.service";
import { SignInStatusComponent } from "app/ui/sign-in-status.component";
import { SimpleSelectComponent } from "app/ui/_generic/simple-select.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";
import { MainMenuComponent } from "app/ui/main-menu.component";
import { LogoExecutorComponent } from "app/ui/_shared/logo-executor.component";
import { FileSelectorComponent } from "app/ui/_generic/file-selector.component";
import { LogoCodeSamplesService } from "app/services/program/logo-code-samples.service";

class LocaleSelector extends SimpleSelectComponent<ILocaleInfo> {}
class ThemeSelector extends SimpleSelectComponent<Theme> {}
class TurtleSelector extends SimpleSelectComponent<TurtleInfo> {}
class TurtleSizeSelector extends SimpleSelectComponent<TurtleSize> {}

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

export class UserProfilePageComponent extends React.Component<IComponentProps, IComponentState> {
  private titleService = resolveInject(TitleService);
  private notificationService = resolveInject(NotificationService);
  private errorService = resolveInject(ErrorService);
  private currentUser = resolveInject(CurrentUserService);
  private userSettingsService = resolveInject(IUserSettingsService);
  private themeService = resolveInject(ThemesService);
  private turtleCustomizationService = resolveInject(TurtlesService);
  private localizationService = resolveInject(LocalizationService);
  private galleryService = resolveInject(PersonalGalleryService);
  private eventsTracking = resolveInject(EventsTrackingService);
  private demoSamplesService = resolveInject(LogoCodeSamplesService);
  private diSetup = resolveInject(DependecyInjectionSetupService);

  private onIsRunningChanged = new Subject<boolean>();
  private runCode = new BehaviorSubject<string>("");
  private exportInportService = new PersonalGalleryImportService();

  constructor(props: IComponentProps) {
    super(props);
    const loginStatus = this.currentUser.getLoginStatus();

    this.state = {
      userInfo: loginStatus.userInfo,
      isSavingInProgress: false,
      programCount: 0
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.settings.settingsTitle);
    this.eventsTracking.sendEvent(EventAction.openSettings);
    await this.loadData();
  }

  private async loadData() {
    const [programs, userSettings] = await Promise.all([
      callActionSafe(this.errorService.handleError, async () => this.galleryService.getAll()),
      callActionSafe(this.errorService.handleError, async () => this.userSettingsService.get())
    ]);
    if (programs && userSettings) {
      const theme = this.themeService.getActiveTheme() || this.themeService.getTheme("Default");
      const locale = this.localizationService.getLocaleById(userSettings.localeId);
      const turtleImage = this.turtleCustomizationService.getTurtleImage(userSettings.turtleId);

      this.setState({
        userSettings: userSettings,
        theme: theme,
        currentLocale: locale,
        turtleImage: turtleImage,
        programCount: programs.length
      });

      this.runCode.next(this.demoSamplesService.getRandomSample());
    }
  }

  private doExport = async () => {
    const programs = await callActionSafe(this.errorService.handleError, async () => this.galleryService.getAll());
    if (programs) {
      const html = await new ProgramsHtmlSerializerService().serialize(
        programs,
        this.currentUser.getLoginStatus().userInfo.attributes.name,
        this.currentUser.getLoginStatus().userInfo.attributes.imageUrl
      );
      const blob = new Blob([html], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, `my-logo-programs.html`);
    }
  };

  private onImport = async (fileInfo: File, content: string) => {
    this.setState({ isImportingInProgress: true });
    const added = await callActionSafe(this.errorService.handleError, async () => {
      const programs = new ProgramsHtmlSerializerService().parse(content);
      return this.exportInportService.importAll(this.galleryService, programs);
    });
    this.setState({ isImportingInProgress: false });
    if (added !== undefined) {
      await this.loadData();
      this.notificationService.push({
        type: "success",
        title: $T.settings.importCompletedTitle,
        message: $T.settings.addedProgramsMessage.val(added),
        closeTimeout: 4000
      });
    }
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <PageHeaderComponent title={$T.settings.settingsTitle} />

            {this.state.userSettings &&
              this.state.currentLocale &&
              this.state.theme &&
              this.state.userInfo && (
                <div className="columns">
                  <div className="column">
                    <div className="card">
                      <div className="card-content">
                        <SignInStatusComponent />
                        <br />

                        <div className="field">
                          <label className="label" htmlFor="language-selector">
                            {$T.settings.language}
                          </label>
                          <div className="control">
                            <div className="select">
                              <LocaleSelector
                                items={this.localizationService.getSupportedLocales()}
                                selectedItem={this.state.currentLocale}
                                getItemIdentifier={x => x.id}
                                renderItem={x => x.name}
                                idAttr="language-selector"
                                selectionChanged={async selectedLocation => {
                                  if (selectedLocation) {
                                    await this.userSettingsService.update({ localeId: selectedLocation.id });
                                    await this.diSetup.reset();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <br />

                        <div className="field">
                          <label className="label" htmlFor="theme-selector">
                            {$T.settings.uiTheme}
                          </label>
                          <div className="control is-expanded">
                            <div className="select is-fullwidth">
                              <ThemeSelector
                                items={this.themeService.getAllThemes()}
                                selectedItem={this.state.theme}
                                getItemIdentifier={x => x.name}
                                renderItem={x => `${x.name} - ${x.description}`}
                                idAttr="theme-selector"
                                selectionChanged={async selectedTheme => {
                                  if (selectedTheme) {
                                    this.setState({ theme: selectedTheme });
                                    await this.userSettingsService.update({ themeName: selectedTheme.name });
                                    this.themeService.setActiveTheme(selectedTheme.name);
                                    await this.loadData();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <br />

                        <label className="label">{$T.settings.turtleSkin}</label>
                        <div className="field">
                          <div className="control">
                            <div className="select">
                              <TurtleSelector
                                items={this.turtleCustomizationService.getAllTurtles()}
                                selectedItem={this.turtleCustomizationService
                                  .getAllTurtles()
                                  .find(x => x.id === ensure(this.state.userSettings).turtleId)}
                                getItemIdentifier={x => x.id}
                                renderItem={x => x.name}
                                selectionChanged={async newTurtle => {
                                  if (newTurtle) {
                                    await this.userSettingsService.update({ turtleId: newTurtle.id });
                                    await this.loadData();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <br />

                        <label className="label">{$T.settings.turtleSize}</label>
                        <div className="field">
                          <div className="control">
                            <div className="select">
                              <TurtleSizeSelector
                                items={this.turtleCustomizationService.getTurtleSizes()}
                                selectedItem={this.turtleCustomizationService
                                  .getTurtleSizes()
                                  .find(x => x.size === ensure(this.state.userSettings).turtleSize)}
                                getItemIdentifier={x => x.size.toString()}
                                renderItem={x => x.description}
                                selectionChanged={async newSize => {
                                  if (newSize) {
                                    await this.userSettingsService.update({ turtleSize: newSize.size });
                                    await this.loadData();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <br />

                        <label className="label">{$T.gallery.personalLibrary}</label>
                        <p>{$T.settings.youHaveNProgramsInLibrary.val(this.state.programCount)}</p>
                        <div className="field is-grouped is-grouped-multiline">
                          <p className="control">
                            <a className="button" onClick={this.doExport}>
                              {$T.settings.export}
                            </a>
                          </p>
                          <p className="control">
                            <FileSelectorComponent
                              className={cn({ "is-loading": this.state.isImportingInProgress })}
                              buttonText={$T.settings.import}
                              onFileTextContentReady={this.onImport}
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="card">
                      <div className="card-content">
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
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}
