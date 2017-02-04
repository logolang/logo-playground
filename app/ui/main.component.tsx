import * as React from 'react';
import * as Color from 'color';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ServiceLocator } from 'app/services/service-locator'
import { LoginStatus, LoginCredentials } from 'app/services/login.service'
import { LoginComponent } from 'app/ui/login.component'
import { PageLoadingIndicatorComponent } from 'app/ui/shared/generic/page-loading-indicator.component';

import { Routes } from 'app/routes';

interface IMainComponentState {
    userLogin: string
    loggedIn: boolean
    isLoading: boolean
}

interface IMainComponentProps {
}

export class MainComponent extends React.Component<IMainComponentProps, IMainComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private loginService = ServiceLocator.resolve(x => x.loginService);

    constructor(props: IMainComponentProps) {
        super(props);

        this.state = {
            userLogin: '',
            loggedIn: false,
            isLoading: false
        }
    }

    onLogin = async (credentials: LoginCredentials): Promise<LoginStatus> => {
        let loginStatus = await this.loginService.login(credentials);
        this.currentUser.setLoginStatus(loginStatus, credentials.rememberMe);
        this.setState({ userLogin: credentials.login, loggedIn: loginStatus.sussess });
        return loginStatus;
    }

    componentDidMount() {
        const storedSettings = this.currentUser.getLocalStoredUserSettings();
        if (storedSettings) {
            this.setState({ isLoading: true });
            this.loginService.loginWithToken(storedSettings.authToken, storedSettings.login)
                .then(loginStatus => {
                    this.currentUser.setLoginStatus(loginStatus, true);
                    if (loginStatus && loginStatus.userInfo) {
                        this.setState({ isLoading: false, userLogin: loginStatus.userInfo.login, loggedIn: loginStatus.sussess });
                    } else {
                        this.setState({ isLoading: false, userLogin: '', loggedIn: false });
                    }
                });
        }
    }

    render(): JSX.Element {
        const isDarkTheme = Color(window.getComputedStyle(document.body, undefined).backgroundColor || 'white').luminosity() < 0.3;
        return <PageLoadingIndicatorComponent isLoading={this.state.isLoading}
            className={`${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            {
                this.state.loggedIn
                    ? this.props.children
                    : this.renderLoginComponent()
            }
        </PageLoadingIndicatorComponent>
    }

    renderLoginComponent(): JSX.Element {
        if (this.state.isLoading) {
            return <div />
        }
        return <LoginComponent login={this.state.userLogin} onSubmit={this.onLogin} />
    }
}