import * as React from "react";
import { resolveInject } from "app/di";
import { $T } from "app/i18n-strings";
import {
  TurtleInfo,
  TurtleSize,
  getTurtles,
  getTurtleSizes,
  getTurtleImage
} from "app/ui/turtles/turtles";
import { Theme, getAllThemes, getActiveTheme, setActiveTheme } from "app/ui/themes/themes-helper";
import { EventsTrackingService, EventAction } from "app/services/env/events-tracking.service";
import { SimpleSelect } from "app/ui/_generic/simple-select";
import { PageHeader } from "app/ui/_generic/page-header";
import { LogoExecutor } from "app/ui/_generic/logo-executor/logo-executor";
import { LogoCodeSamplesService } from "app/services/program/logo-code-samples.service";
import { SignInStatusContainer } from "./sign-in-status.container";
import { MainMenuContainer } from "./main-menu.container";
import { UserSettings, locales } from "app/types/user-settings";
import { UserData } from "app/store/env/state.env";

class LocaleSelector extends SimpleSelect<{ name: string; id: string }> {}
class ThemeSelector extends SimpleSelect<Theme> {}
class TurtleSelector extends SimpleSelect<TurtleInfo> {}
class TurtleSizeSelector extends SimpleSelect<TurtleSize> {}

interface State {
  code: string;
}

interface Props {
  user: UserData;
  userSettings: UserSettings;
  applyUserSettings(settings: Partial<UserSettings>): void;
}

export class UserProfilePage extends React.Component<Props, State> {
  private eventsTracking = resolveInject(EventsTrackingService);
  private demoSamplesService = resolveInject(LogoCodeSamplesService);
  private logoExecutor: LogoExecutor | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      code: this.demoSamplesService.getRandomSample()
    };
  }

  async componentDidMount() {
    this.eventsTracking.sendEvent(EventAction.openSettings);
  }

  async componentDidUpdate(oldProps: Props) {
    if (oldProps.userSettings !== this.props.userSettings) {
      if (this.logoExecutor) {
        this.logoExecutor.abort();
      }
      this.setState({
        code: "setpensize 1.5\n" + this.demoSamplesService.getRandomSample()
      });
    }
  }

  /*
  private doExport = async () => {
    const programs = await callActionSafe(this.errorService.handleError, async () =>
      this.galleryService.getAll()
    );
    if (programs) {
      const html = await new ProgramsHtmlSerializerService().serialize(programs, "User", "");
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
*/
  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <PageHeader title={$T.settings.settingsTitle} />

            <div className="columns">
              <div className="column is-three-fifths-desktop">
                <div className="card">
                  <div className="card-content">
                    <SignInStatusContainer />
                    <br />

                    <div className="field">
                      <label className="label" htmlFor="language-selector">
                        {$T.settings.language}
                      </label>
                      <div className="control">
                        <div className="select">
                          <LocaleSelector
                            items={locales}
                            selectedItem={locales.find(
                              x => x.id === this.props.userSettings.localeId
                            )}
                            getItemIdentifier={x => x.id}
                            renderItem={x => x.name}
                            idAttr="language-selector"
                            selectionChanged={async selectedLocation => {
                              if (selectedLocation) {
                                await this.props.applyUserSettings({
                                  localeId: selectedLocation.id
                                });
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
                            items={getAllThemes()}
                            selectedItem={getActiveTheme()}
                            getItemIdentifier={x => x.name}
                            renderItem={x => `${x.name} - ${x.description}`}
                            idAttr="theme-selector"
                            selectionChanged={async selectedTheme => {
                              if (selectedTheme) {
                                this.props.applyUserSettings({
                                  themeName: selectedTheme.name,
                                  isDarkTheme: selectedTheme.isDark,
                                  editorTheme: selectedTheme.codeEditorThemeName
                                });
                                setActiveTheme(selectedTheme.name);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <br />

                    <div className="columns">
                      <div className="column">
                        <label className="label">{$T.settings.turtleSkin}</label>
                        <div className="field">
                          <div className="control">
                            <div className="select">
                              <TurtleSelector
                                items={getTurtles()}
                                selectedItem={getTurtles().find(
                                  x => x.id === this.props.userSettings.turtleId
                                )}
                                getItemIdentifier={x => x.id}
                                renderItem={x => x.name}
                                selectionChanged={async newTurtle => {
                                  if (newTurtle) {
                                    this.props.applyUserSettings({
                                      turtleId: newTurtle.id
                                    });
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
                                items={getTurtleSizes()}
                                selectedItem={getTurtleSizes().find(
                                  x => x.size === this.props.userSettings.turtleSize
                                )}
                                getItemIdentifier={x => x.size.toString()}
                                renderItem={x => x.description}
                                selectionChanged={async newSize => {
                                  if (newSize) {
                                    this.props.applyUserSettings({
                                      turtleSize: newSize.size
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="column">
                        <LogoExecutor
                          ref={ref => (this.logoExecutor = ref)}
                          isRunning={true}
                          code={this.state.code}
                          onFinish={() => {}}
                          isDarkTheme={this.props.userSettings.isDarkTheme}
                          turtleImage={getTurtleImage(this.props.userSettings.turtleId)}
                          turtleSize={this.props.userSettings.turtleSize}
                        />
                      </div>
                    </div>

                    <br />
                    {/*
                    <label className="label">
                      <span>{$T.gallery.personalLibrary}</span>{" "}
                      <span>
                        (
                        {this.state.programCount > 0
                          ? $T.settings.numberOfProgramsInLibrary.val(this.state.programCount)
                          : $T.settings.emptyLibrary}
                        )
                      </span>
                    </label>
                    <div className="field is-grouped is-grouped-multiline">
                      <p className="control">
                        <a className="button" onClick={this.doExport}>
                          {$T.settings.export}
                        </a>
                      </p>
                      <p className="control">
                        <FileSelector
                          className={cn({ "is-loading": this.state.isImportingInProgress })}
                          buttonText={$T.settings.import}
                          onFileTextContentReady={this.onImport}
                        />
                      </p>
                    </div>
                    /*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
