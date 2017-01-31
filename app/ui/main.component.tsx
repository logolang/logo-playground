import * as React from 'react';
import * as Color from 'color';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ServiceLocator } from 'app/services/service-locator'
import { LoginStatus, LoginCredentials } from 'app/services/login.service'
import { LoginComponent } from 'app/ui/login.component'
import { NavbarUsercardComponent } from 'app/ui/shared/generic/navbar-usercard.component'
import { PageLoadingIndicatorComponent } from 'app/ui/shared/generic/page-loading-indicator.component';

import { Routes } from 'app/routes';

interface IMainComponentState {
    userLogin: string
    loggedIn: boolean
    inProgress: boolean

    isDarkBgNavBar: boolean
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
            inProgress: false,
            isDarkBgNavBar: false
        }
    }

    onLogin = async (credentials: LoginCredentials): Promise<LoginStatus> => {
        let loginStatus = await this.loginService.login(credentials);
        this.currentUser.setLoginStatus(loginStatus, credentials.rememberMe);
        this.setState({ userLogin: credentials.login, loggedIn: loginStatus.sussess });
        return loginStatus;
    }

    menuLogOutClick = async () => {
        this.setState({ inProgress: true });
        await this.loginService.logout();
        this.currentUser.eraseLocalStoredUserSettings();
        this.setState({ inProgress: false, userLogin: '', loggedIn: false });
    }

    componentDidMount() {
        const storedSettings = this.currentUser.getLocalStoredUserSettings();
        if (storedSettings) {
            this.setState({ inProgress: true });
            this.loginService.loginWithToken(storedSettings.authToken, storedSettings.login)
                .then(loginStatus => {
                    this.currentUser.setLoginStatus(loginStatus, true);
                    if (loginStatus && loginStatus.userInfo) {
                        this.setState({ inProgress: false, userLogin: loginStatus.userInfo.login, loggedIn: loginStatus.sussess });
                    } else {
                        this.setState({ inProgress: false, userLogin: '', loggedIn: false });
                    }
                });
        }
        setTimeout(() => {
            let mainBar = document.getElementById('main-nav-bar');
            if (mainBar) {
                const isDarkBgNavBar = Color(window.getComputedStyle(mainBar, undefined).backgroundColor || 'white').luminosity() < 0.3;
                if (this.state.isDarkBgNavBar !== isDarkBgNavBar) {
                    this.setState({ isDarkBgNavBar: isDarkBgNavBar });
                }
            }
        }, 100);
    }

    render(): JSX.Element {
        const isDarkTheme = Color(window.getComputedStyle(document.body, undefined).backgroundColor || 'white').luminosity() < 0.3;
        return <PageLoadingIndicatorComponent isLoading={this.state.inProgress}
            className={`${isDarkTheme ? 'dark-theme' : 'light-theme'} ${this.state.isDarkBgNavBar ? 'dark-navbar' : 'light-navbar'}`}>
            {
                this.state.loggedIn
                    ? this.renderMainMenu()
                    : this.renderLoginComponent()
            }
        </PageLoadingIndicatorComponent>
    }

    renderMainMenu(): JSX.Element {
        let userName = this.currentUser.getLoginStatus().userInfo.attributes.name;

        return <main>
            <Navbar collapseOnSelect fixedTop fluid id="main-nav-bar">
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#" className="ex-app-logo"></a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <LinkContainer to={Routes.dashboardsRoot}>
                            <NavItem><span>Dashboard</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.editorPageRoot}>
                            <NavItem><span>Code</span></NavItem>
                        </LinkContainer>
                    </Nav>
                    <Nav pullRight>
                        <NavDropdown
                            id="menu-user-dropdown" bsClass="dropdown"
                            noCaret
                            title={
                                <NavbarUsercardComponent userName={userName} role={'User'} caret={true}></NavbarUsercardComponent> as any
                            }>
                            <LinkContainer to={Routes.userProfile}>
                                <MenuItem>User Profile</MenuItem>
                            </LinkContainer>
                            <LinkContainer to={Routes.about}>
                                <MenuItem>About</MenuItem>
                            </LinkContainer>
                            <MenuItem divider />
                            <MenuItem onClick={this.menuLogOutClick}>Log Out</MenuItem>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            {/*This dummy navbar is to provide correct top margin for page content*/}
            <nav className="navbar"></nav>

            {this.props.children}
        </main>
    }

    renderLoginComponent(): JSX.Element {
        if (this.state.inProgress) {
            return <div />
        }
        return <LoginComponent login={this.state.userLogin} onSubmit={this.onLogin} />
    }
}