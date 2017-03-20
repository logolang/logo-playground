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

import { Routes } from 'app/routes';
import { ServiceLocator } from 'app/services/service-locator'
import { UserInfo } from "app/services/login/user-info";
import { Theme, ThemeService } from "app/services/customizations/theme.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";

interface IComponentState {
    userInfo: UserInfo;
    theme: Theme;
    isSavingInProgress: boolean;
    programCount: number;

    turtleName: string;
    turtleSize: number;
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
    private themeService = new ThemeService();
    private turtleCustomService = new TurtleCustomizationsService();
    private runCode = new BehaviorSubject<string>('');

    constructor(props: IComponentProps) {
        super(props);
        let loginStatus = this.currentUser.getLoginStatus();

        this.state = {
            userInfo: loginStatus.userInfo,
            theme: this.themeService.getCurrentTheme(),
            isSavingInProgress: false,
            programCount: 0,
            turtleName: this.turtleCustomService.getCurrentTurtleInfo().name,
            turtleSize: this.turtleCustomService.getCurrentTurtleSize()
        };
        this.setRandomCode();
    }

    componentDidMount() {
        this.loadData();
    }

    private setRandomCode() {
        this.runCode.next(codeSamples[RandomHelper.getRandomInt(0, 5)]);
    }

    private async loadData() {
        let programs = await this.programsReporitory.getAll();
        this.setState({ programCount: programs.length });
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
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <select className="form-control" id="themeselector"
                                                value={this.state.theme.name} onChange={translateSelectChangeToState(this, (s, v) => {
                                                    const selectedTheme = this.themeService.getAllThemes().find(t => t.name === v);
                                                    if (selectedTheme) {
                                                        this.themeService.setTheme(selectedTheme);
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
                                </div>
                                <br />
                                <div className="form-group">
                                    <label htmlFor="turtleSelector">Turtle</label>
                                    <div className="row">
                                        <div className="col-sm-8">
                                            <select className="form-control" id="turtleSelector"
                                                value={this.state.turtleName} onChange={translateSelectChangeToState(this, (s, v) => {
                                                    this.turtleCustomService.setCurrentTurtle(v, s.turtleSize);
                                                    this.setRandomCode();
                                                    return { turtleName: v };
                                                })}>
                                                {
                                                    this.turtleCustomService.getAllTurtles().map(t => {
                                                        return <option key={t.name} value={t.name}>{t.name}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                        <div className="col-sm-4">
                                            <select className="form-control" id="turtleSelector"
                                                value={this.state.turtleSize} onChange={translateSelectChangeToState(this, (s, v) => {
                                                    this.turtleCustomService.setCurrentTurtle(s.turtleName, v as any);
                                                    this.setRandomCode();
                                                    return { turtleSize: v as any };
                                                })}>
                                                <option value={20}>Extra Small</option>
                                                <option value={32}>Small</option>
                                                <option value={40}>Medium</option>
                                                <option value={52}>Large</option>
                                                <option value={72}>Huge</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
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
                        {[
                            <LogoExecutorComponent
                                key={RandomHelper.getRandomObjectId(6)}
                                height={400}
                                onError={() => { }}
                                onIsRunningChanged={() => { }}
                                runCommands={this.runCode}
                                stopCommands={new Subject<void>()}
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