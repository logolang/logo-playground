import * as React from 'react';
import { Link } from 'react-router'
import * as cn from 'classnames';

import { translateCheckBoxChangeToState, translateInputChangeToState } from 'app/utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { LoginCredentials, LoginStatus } from 'app/services/login.service';

import './login.component.scss'

interface ILoginFormComponentState {
    errorMessage: string
    login: string
    password: string
    rememberMe: boolean
    inProgress: boolean
}

interface ILoginFormComponentProps {
    onSubmit: (credentials: LoginCredentials) => Promise<LoginStatus>
}

export class LoginComponent extends React.Component<ILoginFormComponentProps, ILoginFormComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);

    constructor(props: ILoginFormComponentProps) {
        super(props);

        this.state = {
            errorMessage: '',
            inProgress: false,
            login: '',
            rememberMe: false,
            password: ''
        };
    }

    componentDidMount = () => {
        let form = document.getElementById('loginForm');
        if (form) {
            console.log('got the form');
            form.onsubmit = () => {
                setTimeout(async () => {
                    this.performSubmitting();
                }, 0);
                return false;
            }
        }
    }

    async performSubmitting() {
        this.setState({ errorMessage: '', inProgress: true });

        let result = await this.props.onSubmit({
            login: this.state.login,
            password: this.state.password,
            rememberMe: this.state.rememberMe
        });

        if (!result.isLoggedIn) {
            this.setState({ errorMessage: result.errorMessage, inProgress: false });
        } else {
            // this is to trigger save password in Chrome
            history.pushState({}, "", window.location.href);
        }
    }

    triggerSubmitOnInputEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.which == 13) {
            (document.getElementById('loginSubmitBtn') as HTMLInputElement).click();
        }
    }

    render(): JSX.Element {
        return (
            <div className="container container-login">
                <form id="loginForm" method="post" className="form-signin" style={{ backgroundColor: window.getComputedStyle(document.body, undefined).backgroundColor }} >
                    <div className="row">
                        <div className="col-sm-12">
                            <h2>Log In</h2>
                            <br />
                            {
                                this.state.errorMessage && <div className="alert alert-danger">
                                    <p>{this.state.errorMessage}</p>
                                </div>
                            }
                        </div>
                    </div>
                    <fieldset>
                        <div className="form-group">
                            <label htmlFor="userLogin">Username</label>
                            <div className="row">
                                <div className="col-sm-12">
                                    <input type="text" id="userLogin" className="form-control" placeholder="Username" required
                                        value={this.state.login}
                                        onChange={translateInputChangeToState(this, (state, value) => ({ login: value }))}
                                        onKeyDown={this.triggerSubmitOnInputEnterKeyDown}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="userPassword">Password</label>
                            <div className="row">
                                <div className="col-sm-12">
                                    <input type="password" id="userPassword" className="form-control" placeholder="Password" required
                                        value={this.state.password}
                                        onChange={translateInputChangeToState(this, (state, value) => ({ password: value }))}
                                        onKeyDown={this.triggerSubmitOnInputEnterKeyDown}
                                    />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <br />
                    <button id="loginSubmitBtn" type="submit" className={cn("btn btn-info btn-block", { "is-loading": this.state.inProgress })}>
                        <span>Log In</span>
                    </button>
                    <br />
                    <div className="checkbox keepmeloggeincheckbox">
                        <label>
                            <input type="checkbox"
                                checked={this.state.rememberMe}
                                onChange={translateCheckBoxChangeToState(this, (state, value) => ({ rememberMe: value }))}
                            /> Keep me logged in
                        </label>
                    </div>
                </form>
            </div>
        );
    }
}
