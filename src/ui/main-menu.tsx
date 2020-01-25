import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import * as cn from "classnames";

import { Routes } from "ui/routes";
import { $T } from "i18n-strings";
import { CheatSheetModal } from "./modals/cheat-sheet-modal";
import { ErrorDef } from "utils/error";

interface State {
  isMenuToggled?: boolean;
  isCheatSheetOpen?: boolean;
}

interface Props {
  isLoggedIn: boolean;
  userImageUrl: string;
  onLogout(): void;
  onError(errorDef: ErrorDef): void;
}

export class MainMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <>
        <nav className="navbar navbar-mobile-fix" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <Link className="navbar-item" to={Routes.gallery.build({})}>
              <span className="ex-app-logo" />
            </Link>

            <div
              className={cn("navbar-burger burger", { "is-active": this.state.isMenuToggled })}
              onClick={() => {
                this.setState({ isMenuToggled: !this.state.isMenuToggled });
              }}
            >
              <span />
              <span />
              <span />
            </div>
          </div>

          <div
            className={cn("navbar-menu", { "is-active": this.state.isMenuToggled })}
            onClick={() => this.setState({ isMenuToggled: false })}
          >
            <div className="navbar-start">
              <NavLink
                className="navbar-item"
                activeClassName="is-active"
                to={Routes.gallery.build({})}
              >
                {$T.gallery.galleryTitle}
              </NavLink>
              <NavLink
                className="navbar-item"
                activeClassName="is-active"
                to={Routes.tutorials.build({})}
              >
                {$T.tutorial.tutorialsTitle}
              </NavLink>
              <a
                href="#"
                className="navbar-item"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ isCheatSheetOpen: true });
                }}
              >
                {$T.cheatSheet.cheatSheetTitle}
              </a>
              <NavLink
                className="navbar-item"
                activeClassName="is-active"
                to={Routes.playgroundDefault.build({})}
              >
                {$T.program.playgroundTitle}
              </NavLink>
            </div>
            <div className="navbar-end">
              <div className="navbar-item has-dropdown is-hoverable">
                <span className="navbar-link">
                  {this.props.userImageUrl ? (
                    <img src={this.props.userImageUrl} />
                  ) : (
                    <span>
                      <i className="far fa-user" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <div className="navbar-dropdown is-right">
                  <NavLink
                    className="navbar-item"
                    activeClassName="is-active"
                    to={Routes.settings.build({})}
                  >
                    <i className="fa fa-wrench icon-fixed-width" aria-hidden="true" />
                    {$T.settings.settingsTitle}
                  </NavLink>
                  <NavLink
                    className="navbar-item"
                    activeClassName="is-active"
                    to={Routes.infoPage.build({})}
                  >
                    <i className="fa fa-info icon-fixed-width" aria-hidden="true" />
                    {$T.about.aboutTitle}
                  </NavLink>
                  <hr className="navbar-divider" />
                  {!this.props.isLoggedIn && (
                    <NavLink
                      className="navbar-item"
                      activeClassName="is-active"
                      to={Routes.loginPage.build({})}
                    >
                      <i className="fas fa-sign-in-alt icon-fixed-width" aria-hidden="true" />
                      {$T.common.signIn}
                    </NavLink>
                  )}
                  {this.props.isLoggedIn && (
                    <a
                      href="#"
                      className="navbar-item"
                      onClick={e => {
                        e.preventDefault();
                        this.props.onLogout();
                      }}
                    >
                      <i className="fas fa-sign-out-alt icon-fixed-width" aria-hidden="true" />
                      {$T.common.signOut}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        {this.state.isCheatSheetOpen && (
          <CheatSheetModal
            onClose={() => this.setState({ isCheatSheetOpen: false })}
            onError={this.props.onError}
          />
        )}
      </>
    );
  }
}
