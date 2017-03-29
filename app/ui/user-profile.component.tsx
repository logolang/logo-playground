import * as React from 'react';
import * as cn from 'classnames';
import * as FileSaver from 'file-saver';
import { Link } from 'react-router'
import { Subject, BehaviorSubject } from 'rxjs'

import { goBack, translateSelectChangeToState } from 'app/utils/react-helpers';
import { stay } from 'app/utils/async-helpers';
import { RandomHelper } from 'app/utils/random-helper';

import { DateTimeStampComponent } from 'app/ui/_generic/date-time-stamp.component';
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { LogoExecutorComponent } from 'app/ui/_shared/logo-executor.component';

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from 'app/routes';
import { UserInfo } from "app/services/login/user-info";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";
import { IUserCustomizationsData, UserCustomizationsProvider } from "app/services/customizations/user-customizations-provider";
import { Theme, ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";

interface IComponentState {
    userInfo: UserInfo;
    isSavingInProgress: boolean;
    programCount: number;

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
    }

    private setRandomCode() {
        this.runCode.next(codeSamples[RandomHelper.getRandomInt(0, codeSamples.length - 1)]);
    }

    private async loadData() {
        let programs = await this.programsReporitory.getAll();
        const userCustomizations = await this.userCustomizationsProvider.getCustomizationsData();
        const themeName = await this.userSettingsService.getUiThemeName();
        const theme = this.themeService.getTheme(themeName);
        this.setState({
            userCustomizations: userCustomizations,
            theme: theme,
            programCount: programs.length
        });
    }

    private doExport = async () => {
        let programs = await this.programsReporitory.getAll();
        let data = JSON.stringify(programs, null, 2);
        const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        FileSaver.saveAs(blob, `logo-sandbox-personal-gallery.json`);
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <MainMenuComponent />
                <PageHeaderComponent title="User Profile" />
                <div className="row">
                    <div className="col-sm-6">
                        <p><strong>Login:</strong> {this.state.userInfo.login}</p>
                        <p><strong>Name:</strong> {this.state.userInfo.attributes.name}</p>
                        <br />
                        <br />
                        <form>
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="themeselector">User Interface Theme</label>
                                    {
                                        this.state.theme &&
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <select className="form-control" id="themeselector"
                                                    value={this.state.theme.name} onChange={translateSelectChangeToState(this, (s, v) => {
                                                        const selectedTheme = this.themeService.getAllThemes().find(t => t.name === v);
                                                        if (selectedTheme) {
                                                            this.userSettingsService.setUiThemeName(selectedTheme.name);
                                                            window.localStorage.setItem((window as any).appThemeNameLocalStorageKey, JSON.stringify(selectedTheme));
                                                            setTimeout(function () {
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
                                        <label htmlFor="turtleSelector">Turtle</label>
                                        <div className="row">
                                            <div className="col-sm-8">
                                                <select className="form-control" id="turtleSelector"
                                                    value={this.state.userCustomizations.customTurtleName} onChange={async (event) => {
                                                        const value = event.target.value;
                                                        this.userSettingsService.setTurtleName(value);
                                                        await this.loadData();
                                                        this.setRandomCode();
                                                    }}>
                                                    {
                                                        this.turtleCustomService.getAllTurtles().map(t => {
                                                            return <option key={t.name} value={t.name}>{t.name}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            <div className="col-sm-4">
                                                <select className="form-control" id="turtleSelector"
                                                    value={this.state.userCustomizations.customTurtleSize} onChange={async (event) => {
                                                        const value = parseInt(event.target.value);
                                                        this.userSettingsService.setTurtleSize(value);
                                                        await this.loadData();
                                                        this.setRandomCode();
                                                    }}>
                                                    <option value={20}>Extra Small</option>
                                                    <option value={32}>Small</option>
                                                    <option value={40}>Medium</option>
                                                    <option value={52}>Large</option>
                                                    <option value={72}>Huge</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <br />
                                <div className="form-group">
                                    <label>Personal Gallery</label>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <blockquote className="ex-font-size-normal">
                                                <p>Programs count: {this.state.programCount}</p>
                                                <div className="btn-toolbar">
                                                    <button type="button" className="btn btn-default"
                                                        onClick={this.doExport}>
                                                        <span>Export</span>
                                                    </button>
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
                                    key={RandomHelper.getRandomObjectId(6)} //this is a hack to force component to be created each render in order to not handle prop change event
                                    height={400}
                                    onError={() => { }}
                                    onIsRunningChanged={() => { }}
                                    runCommands={this.runCode}
                                    stopCommands={new Subject<void>()}
                                    customTurtleImage={this.state.userCustomizations.customTurtle}
                                    customTurtleSize={this.state.userCustomizations.customTurtleSize}
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