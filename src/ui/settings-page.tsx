import * as React from "react";
import { resolve } from "utils/di";
import { $T } from "i18n-strings";
import {
  TurtleInfo,
  TurtleSize,
  getTurtles,
  getTurtleSizes,
  getTurtleById
} from "ui/turtles/turtles";
import { Theme, themesManager } from "ui/themes-helper";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";
import { SimpleSelect } from "ui/_generic/simple-select";
import { PageHeader } from "ui/_generic/page-header";
import { LogoExecutor } from "ui/_generic/logo-executor/logo-executor";
import { LogoCodeSamplesService } from "services/logo-code-samples.service";
import { MainMenuContainer } from "./main-menu.container";
import { UserSettings, locales } from "services/user-settings";
import { UserData } from "services/infrastructure/auth-service";

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
  appTheme: Theme;
  applyUserSettings(settings: Partial<UserSettings>, options?: { rebindServices: boolean }): void;
}

export class SettingsPage extends React.Component<Props, State> {
  private eventsTracking = resolve(EventsTrackingService);
  private demoSamplesService = resolve(LogoCodeSamplesService);
  private logoExecutor?: LogoExecutor;

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

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <PageHeader title={$T.settings.settingsTitle} />
            <br />

            <div className="field">
              <label className="label" htmlFor="language-selector">
                {$T.settings.language}
              </label>
              <div className="control">
                <div className="select">
                  <LocaleSelector
                    items={locales}
                    selectedItem={locales.find(x => x.id === this.props.userSettings.localeId)}
                    getItemIdentifier={x => x.id}
                    renderItem={x => x.name}
                    id="language-selector"
                    selectionChanged={async selectedLocation => {
                      if (selectedLocation) {
                        this.props.applyUserSettings(
                          { localeId: selectedLocation.id },
                          { rebindServices: true }
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <br />

            <div className="columns">
              <div className="column">
                <label className="label" htmlFor="theme-selector">
                  {$T.settings.uiTheme}
                </label>
                <div className="field">
                  <div className="control is-expanded">
                    <div className="select is-fullwidth">
                      <ThemeSelector
                        items={themesManager.themes}
                        selectedItem={this.props.appTheme}
                        getItemIdentifier={x => x.name}
                        renderItem={x => `${x.name} - ${x.description}`}
                        id="theme-selector"
                        selectionChanged={async selectedTheme => {
                          if (selectedTheme) {
                            this.props.applyUserSettings({ themeName: selectedTheme.name });
                            themesManager.setTheme(selectedTheme);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <br />

                <label className="label" htmlFor="turtle-skin-selector">
                  {$T.settings.turtleSkin}
                </label>
                <div className="field">
                  <div className="control">
                    <div className="select">
                      <TurtleSelector
                        id="turtle-skin-selector"
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

                <label className="label" htmlFor="turtle-size-selector">
                  {$T.settings.turtleSize}
                </label>
                <div className="field">
                  <div className="control">
                    <div className="select">
                      <TurtleSizeSelector
                        id="turtle-size-selector"
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
                <div className="card" style={{ height: 300 }}>
                  <LogoExecutor
                    ref={ref => (this.logoExecutor = ref || undefined)}
                    isRunning={true}
                    code={this.state.code}
                    onFinish={() => {
                      /* Nothing here */
                    }}
                    isDarkTheme={this.props.appTheme.isDark}
                    turtleImageSrc={getTurtleById(this.props.userSettings.turtleId).imageSrc}
                    turtleSize={this.props.userSettings.turtleSize}
                  />
                </div>
              </div>
            </div>

            <br />
          </div>
        </div>
      </div>
    );
  }
}
