import * as React from 'react';
import * as Color from 'color';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ServiceLocator } from 'app/services/service-locator'
import { LoginStatus, LoginCredentials } from 'app/services/login.service'
import { NavbarUsercardComponent } from 'app/ui/shared/generic/navbar-usercard.component'

import { Routes } from 'app/routes';

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
        let userName = this.currentUser.getLoginStatus().userInfo.attributes.name;

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
                        <LinkContainer to={Routes.dashboardsRoot}>
                            <NavItem><span>Gallery</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.docPageRoot}>
                            <NavItem><span>Documentation</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.tutorialsPageRoot}>
                            <NavItem><span>Tutorials</span></NavItem>
                        </LinkContainer>
                        <LinkContainer to={Routes.playground}>
                            <NavItem><span>Playground</span></NavItem>
                        </LinkContainer>
                    </Nav>

                    {this.props.children}

                    <Nav pullRight>
                        <NavDropdown
                            id="menu-user-dropdown" bsClass="dropdown"
                            noCaret
                            title={
                                <NavbarUsercardComponent userName={userName} role={'Contributor'} caret={true}></NavbarUsercardComponent> as any
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

                    {this.props.pullRightChildren}
                </Navbar.Collapse>
            </Navbar>

            {/*This dummy navbar is to provide correct top margin for page content*/}
            <nav className="navbar"></nav>
        </div>
    }
}