import * as React from 'react';
import * as cn from 'classnames';
import * as FileSaver from 'file-saver'
import { Link } from 'react-router'

import { goBack, translateSelectChangeToState } from 'app/utils/react-helpers';
import { stay } from 'app/utils/async-helpers';

import { Routes } from 'app/routes';
import { ServiceLocator } from 'app/services/service-locator'

import { UserInfo } from 'app/model/entities/user-info';
import { ThemeService, Theme } from 'app/services/theme.service';

import { DateTimeStampComponent } from 'app/ui/shared/generic/date-time-stamp.component';
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { MainMenuComponent } from 'app/ui/main-menu.component'

interface IComponentState {
    userInfo: UserInfo;
    theme: Theme;
    isSavingInProgress: boolean;
    programCount: number;
}

interface IComponentProps {
}

export class UserProfileComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private programsReporitory = ServiceLocator.resolve(x => x.programsReporitory);
    private themeService = new ThemeService();

    constructor(props: IComponentProps) {
        super(props);
        let loginStatus = this.currentUser.getLoginStatus();

        this.state = {
            userInfo: loginStatus.userInfo,
            theme: this.themeService.getCurrentTheme(),
            isSavingInProgress: false,
            programCount: 0
        };
    }

    componentDidMount() {
        this.loadData();
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
                    <div className="col-sm-12">
                        <p><strong>Login:</strong> {this.state.userInfo.login}</p>
                        <p><strong>Name:</strong> {this.state.userInfo.attributes.name}</p>
                        <br />
                        <br />
                        <form>
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="themeselector">User Interface Theme</label>
                                    <div className="row">
                                        <div className="col-sm-5">
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
                                    <label>Personal Gallery</label>
                                    <div className="row">
                                        <div className="col-sm-5">
                                            <blockquote className="ex-font-size-normal">
                                                <p>Programs count: {this.state.programCount}</p>
                                                <div className="btn-toolbar">
                                                    <button type="button" className="btn btn-default"
                                                        onClick={this.doExport}>
                                                        <span>Export</span>
                                                    </button>
                                                    <button type="button" className="btn btn-default"
                                                    >
                                                        <span>Import</span>
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
                    </div >
                </div >
            </div >
        );
    }
}