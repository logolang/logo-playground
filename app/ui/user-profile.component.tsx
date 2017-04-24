import * as React from 'react';
import * as cn from 'classnames';
import * as FileSaver from 'file-saver';
import { Link } from 'react-router'
import { Subject, BehaviorSubject } from 'rxjs'

import { goBack, translateSelectChangeToState } from 'app/utils/react-helpers';
import { stay, setupActionErrorHandler, callAction } from 'app/utils/async-helpers';
import { RandomHelper } from 'app/utils/random-helper';

import { DateTimeStampComponent } from 'app/ui/_generic/date-time-stamp.component';
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { LogoExecutorComponent } from 'app/ui/_shared/logo-executor.component';
import { FileSelectorComponent } from "app/ui/_generic/file-selector.component";

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from 'app/routes';
import { UserInfo } from "app/services/login/user-info";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";
import { IUserCustomizationsData, UserCustomizationsProvider } from "app/services/customizations/user-customizations-provider";
import { Theme, ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";
import { ProgramsExportImportService } from "app/services/gallery/programs-export-import.service";
import { LocalizationService, ILocaleInfo, _T } from "app/services/customizations/localization.service";

interface IComponentState {
    userInfo: UserInfo;
    isSavingInProgress: boolean;
    programCount: number;

    currentLocale?: ILocaleInfo;
    theme?: Theme;
    userCustomizations?: IUserCustomizationsData
}

interface IComponentProps {
}

const codeSamples = [
    'pu setxy -40 -20 pd repeat 8 [fd 40 rt 360/8]',
    'repeat 10 [repeat 8 [fd 20 rt 360/8] rt 360/10]',
    'repeat 14 [fd repcount*8 rt 90]',
    'window repeat 10 [fd 5 * repcount repeat 3 [fd 18 rt 360/3] rt 360/10]',
    'pu setxy -20 -20 pd repeat 8 [rt 45 repeat 4 [repeat 90 [fd 1 rt 2] rt 90]]',
    'repeat 10 [fd 10 rt 90 fd 10 lt 90]'
]

export class UserProfileComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private programsReporitory = ServiceLocator.resolve(x => x.programsReporitory);
    private userCustomizationsProvider = new UserCustomizationsProvider();
    private themeService = new ThemeCustomizationsService();
    private userSettingsService = ServiceLocator.resolve(x => x.userSettingsService);
    private turtleCustomService = new TurtleCustomizationsService();
    private runCode = new BehaviorSubject<string>('');
    private exportInportService = new ProgramsExportImportService();
    private notificationService = ServiceLocator.resolve(x => x.notificationService);
    private titleService = ServiceLocator.resolve(x => x.titleService);
    private localizationService = new LocalizationService();
    private errorHandler = setupActionErrorHandler((error) => {
        this.notificationService.push({ type: 'danger', message: error });
    })

    constructor(props: IComponentProps) {
        super(props);
        let loginStatus = this.currentUser.getLoginStatus();

        this.state = {
            userInfo: loginStatus.userInfo,
            isSavingInProgress: false,
            programCount: 0,
        };
        this.setRandomCode();
    }

    componentDidMount() {
        this.loadData();
        this.titleService.setDocumentTitle(_T("User profile"));
    }

    private setRandomCode() {
        this.runCode.next(codeSamples[RandomHelper.getRandomInt(0, codeSamples.length - 1)]);
    }

    private async loadData() {
        const [programs, userCustomizations, userSettings] = await Promise.all([
            callAction(this.errorHandler, () => this.programsReporitory.getAll()),
            callAction(this.errorHandler, () => this.userCustomizationsProvider.getCustomizationsData()),
            callAction(this.errorHandler, () => this.userSettingsService.get())
        ]);
        if (programs && userCustomizations && userSettings) {
            const theme = this.themeService.getTheme(userSettings.themeName);
            const locale = this.localizationService.getLocaleById(userCustomizations.localeId);

            this.setState({
                userCustomizations: userCustomizations,
                theme: theme,
                programCount: programs.length,
                currentLocale: locale
            });
        }
    }

    private doExport = async () => {
        const data = await callAction(this.errorHandler, () => this.exportInportService.exportAll(this.programsReporitory));
        const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        FileSaver.saveAs(blob, `logo-sandbox-personal-gallery.json`);
    }

    private onImport = async (fileInfo: File, content: string) => {
        const added = await callAction(this.errorHandler, () => this.exportInportService.importAll(this.programsReporitory, content));
        if (added !== undefined) {
            await this.loadData();
            this.notificationService.push({
                type: 'success',
                title: _T('Import completed'),
                message: _T('Added programs: %d', { value: added }),
                closeTimeout: 4000
            });
        }
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <MainMenuComponent />
                <PageHeaderComponent title={_T("User settings")} />
                <div className="row">
                    <div className="col-sm-6">
                        <p><strong>Login:</strong> {this.state.userInfo.login}</p>
                        <p><strong>Name:</strong> {this.state.userInfo.attributes.name}</p>
                        <br />
                        <br />
                        <form>
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="localeselector">{_T("Language")}</label>
                                    {
                                        this.state.currentLocale &&
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <select className="form-control" id="localeselector"
                                                    value={this.state.currentLocale.id} onChange={translateSelectChangeToState(this, (s, v) => {
                                                        const selectedLocation = this.localizationService.getSupportedLocales().find(loc => loc.id === v);
                                                        if (selectedLocation) {
                                                            setTimeout(async () => {
                                                                await this.userSettingsService.update({ localeId: selectedLocation.id });
                                                                // refresh browser window
                                                                window.location.reload(true);
                                                            }, 0);
                                                        }
                                                        return {};
                                                    })}>
                                                    {
                                                        this.localizationService.getSupportedLocales().map(loc => {
                                                            return <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="form-group">
                                    <label htmlFor="themeselector">{_T("User interface theme")}</label>
                                    {
                                        this.state.theme &&
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <select className="form-control" id="themeselector"
                                                    value={this.state.theme.name} onChange={translateSelectChangeToState(this, (s, v) => {
                                                        const selectedTheme = this.themeService.getAllThemes().find(t => t.name === v);
                                                        if (selectedTheme) {
                                                            setTimeout(async () => {
                                                                await this.userSettingsService.update({ themeName: selectedTheme.name });
                                                                window.localStorage.setItem((window as any).appThemeNameLocalStorageKey, JSON.stringify(selectedTheme));
                                                                // refresh browser window
                                                                window.location.reload(true);
                                                            }, 0);
                                                        }
                                                        return {};
                                                    })}>
                                                    {
                                                        this.themeService.getAllThemes().map(t => {
                                                            return <option key={t.name} value={t.name}>{t.name}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <br />
                                {
                                    this.state.userCustomizations &&
                                    <div className="form-group">
                                        <label htmlFor="turtleSelector">{_T("Turtle")}</label>
                                        <div className="row">
                                            <div className="col-sm-8">
                                                <select className="form-control" id="turtleSelector"
                                                    value={this.state.userCustomizations.turtleId} onChange={async (event) => {
                                                        const value = event.target.value;
                                                        await this.userSettingsService.update({ turtleId: value });
                                                        await this.loadData();
                                                        this.setRandomCode();
                                                    }}>
                                                    {
                                                        this.turtleCustomService.getAllTurtles().map(t => {
                                                            return <option key={t.id} value={t.id}>{t.getName()}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            <div className="col-sm-4">
                                                <select className="form-control" id="turtleSelector"
                                                    value={this.state.userCustomizations.turtleSize} onChange={async (event) => {
                                                        const value = parseInt(event.target.value);
                                                        await this.userSettingsService.update({ turtleSize: value });
                                                        await this.loadData();
                                                        this.setRandomCode();
                                                    }}>
                                                    <option value={20}>{_T("Extra Small")}</option>
                                                    <option value={32}>{_T("Small")}</option>
                                                    <option value={40}>{_T("Medium")}</option>
                                                    <option value={52}>{_T("Large")}</option>
                                                    <option value={72}>{_T("Huge")}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <br />
                                <div className="form-group">
                                    <label>{_T("Personal library")}</label>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <blockquote className="ex-font-size-normal">
                                                <p>{_T("You have %d program", { plural: "You have %d programs", value: this.state.programCount })}</p>
                                                <div className="btn-toolbar">
                                                    <button type="button" className="btn btn-default"
                                                        onClick={this.doExport}>
                                                        <span>{_T("Export")}</span>
                                                    </button>
                                                    <FileSelectorComponent buttonText={_T("Import")} onFileTextContentReady={this.onImport} />
                                                </div>
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>
                                <br />
                                <br />
                            </fieldset>
                        </form >
                    </div>
                    <div className="col-sm-4">
                        {
                            this.state.userCustomizations && [
                                <LogoExecutorComponent
                                    key={`${JSON.stringify(this.state.userCustomizations)}`} //this is a hack to force component to be created each render in order to not handle prop change event
                                    height={400}
                                    onError={() => { }}
                                    onIsRunningChanged={() => { }}
                                    runCommands={this.runCode}
                                    stopCommands={new Subject<void>()}
                                    customTurtleImage={this.state.userCustomizations.turtleImage}
                                    customTurtleSize={this.state.userCustomizations.turtleSize}
                                    isDarkTheme={this.state.userCustomizations.isDark}
                                />
                            ]}
                    </div>
                    <div className="col-sm-2">
                    </div>
                </div >
            </div >
        );
    }
}