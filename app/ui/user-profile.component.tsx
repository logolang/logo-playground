import * as React from 'react';
import * as cn from 'classnames';
import { Link } from 'react-router'

import { goBack, translateSelectChangeToState } from 'app/utils/react-helpers';
import { stay } from 'app/utils/async-helpers';

import { Routes } from 'app/routes';
import { ServiceLocator } from 'app/services/service-locator'

import { UserInfo } from 'app/model/entities/user-info';
import { LocalStorageService } from 'app/services/local-storage.service';

import { DateTimeStampComponent } from 'app/ui/shared/generic/date-time-stamp.component';
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';

interface IComponentState {
    userInfo: UserInfo;
    themeName: string;
    isSavingInProgress: boolean;
}

interface IComponentProps {
}

export class UserProfileComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private localStorageThemeKey = new LocalStorageService<string>((window as any).appThemeNameLocalStorageKey, undefined);

    constructor(props: IComponentProps) {
        super(props);
        let loginStatus = this.currentUser.getLoginStatus();

        this.state = {
            userInfo: loginStatus.userInfo,
            themeName: this.localStorageThemeKey.getValue() || 'default',
            isSavingInProgress: false,
        };
    }

    render(): JSX.Element {
        return (
            <div className="container">
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
                                                value={this.state.themeName} onChange={translateSelectChangeToState(this, (s, v) => {
                                                    this.localStorageThemeKey.setValue(v);
                                                    setTimeout(function () {
                                                        // refresh browser window
                                                        window.location.reload(true);
                                                    }, 100);
                                                    return { themeName: v };
                                                })}>
                                                <option value="default">Default</option>
                                                <option value="yeti">Yeti</option>
                                                <option value="darkly">Darkly</option>
                                                <option value="cerulean">Cerulean</option>
                                                <option value="slate">Slate</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <br />
                                <br />
                                <div className="form-group">
                                    <div className="btn-toolbar">
                                        <button type="button" className={cn("btn btn-primary", { "is-loading": this.state.isSavingInProgress })}
                                            onClick={async () => {
                                                this.setState({ isSavingInProgress: true });
                                                await stay(1000);
                                                goBack();
                                            }}>
                                            <span>Save</span>
                                        </button>
                                        <button type="button" className="btn btn-link"
                                            onClick={goBack}>
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                        </form >
                    </div >
                </div >
            </div >
        );
    }
}