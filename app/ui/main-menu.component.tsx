import * as React from 'react';
import * as Color from 'color';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ServiceLocator } from 'app/services/service-locator'
import { NavbarUsercardComponent } from 'app/ui/_generic/navbar-usercard.component'

import { Routes } from 'app/routes';
import { _T } from "app/services/customizations/localization.service";

let globalIsDarkNavbar = false;

interface IComponentState {
    isDarkBgNavBar: boolean
}

interface IComponentProps {
    pullRightChildren?: JSX.Element
}

export class MainMenuComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private loginService = ServiceLocator.resolve(x => x.loginService);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isDarkBgNavBar: globalIsDarkNavbar
        }
    }

    menuLogOutClick = async () => {
        await this.loginService.logout();
        this.currentUser.eraseLocalStoredUserSettings();

        // refresh browser window
        window.location.reload(true);
    }

    componentDidMount() {
        setTimeout(() => {
            let mainBar = document.getElementById('main-nav-bar');
            if (mainBar) {
                const isDarkBgNavBar = Color(window.getComputedStyle(mainBar, undefined).backgroundColor || 'white').luminosity() < 0.3;
                if (this.state.isDarkBgNavBar !== isDarkBgNavBar) {
                    globalIsDarkNavbar = isDarkBgNavBar;
                    this.setState({ isDarkBgNavBar: isDarkBgNavBar });
                }
            }
        }, 100);
    }

    render(): JSX.Element {
        const loginStatus = this.currentUser.getLoginStatus();

        return <div className={`${this.state.isDarkBgNavBar ? 'dark-navbar' : 'light-navbar'}`}>
            <Navbar collapseOnSelect fixedTop fluid id="main-nav-bar">
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#" className="ex-app-logo"></a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <LinkContainer to={Routes.galleryRoot.build({})}>
                            <NavItem><span>{_T("Gallery")}</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.documentationRoot.build({})}>
                            <NavItem><span>{_T("Documentation")}</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.tutorialsRoot.build({})}>
                            <NavItem><span>{_T("Tutorials")}</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.playgroundRoot.build({})}>
                            <NavItem><span>{_T("Playground")}</span></NavItem>
                        </LinkContainer>
                    </Nav>

                    {this.props.children}

                    <Nav pullRight>
                        <NavDropdown
                            id="menu-user-dropdown" bsClass="dropdown"
                            noCaret
                            title={
                                <NavbarUsercardComponent
                                    userName={loginStatus.userInfo.attributes.name}
                                    role={'Contributor'}
                                    caret={true}
                                    loggedIn={loginStatus.isLoggedIn}
                                >
                                </NavbarUsercardComponent> as any
                            }>
                            {
                                !loginStatus.isLoggedIn &&
                                <MenuItem onClick={() => { this.loginService.requestNewLogin() }}>
                                    <span className="glyphicon glyphicon-log-in" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;{_T("Log In")}</span>
                                </MenuItem>
                            }
                            {
                                !loginStatus.isLoggedIn &&
                                <MenuItem divider />
                            }
                            <LinkContainer to={Routes.settingsRoot.build({})}>
                                <MenuItem>
                                    <span className="glyphicon glyphicon-user" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;{_T("User Profile")}</span>
                                </MenuItem>
                            </LinkContainer>
                            <LinkContainer to={Routes.aboutRoot.build({})}>
                                <MenuItem>
                                    <span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;{_T("About...")}</span>
                                </MenuItem>
                            </LinkContainer>
                            {
                                loginStatus.isLoggedIn &&
                                <MenuItem divider />
                            }
                            {
                                loginStatus.isLoggedIn &&
                                <MenuItem onClick={this.menuLogOutClick}>
                                    <span className="glyphicon glyphicon-log-out" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;{_T("Log Out")}</span>
                                </MenuItem>
                            }
                        </NavDropdown>
                    </Nav>

                    {this.props.pullRightChildren}
                </Navbar.Collapse>
            </Navbar>

            {/*This dummy navbar is to provide correct top margin for page content*/}
            <nav className="navbar ex-margin-bottom-zero"></nav>
        </div>
    }
}