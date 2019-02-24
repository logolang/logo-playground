import * as React from "react";
import { Link } from "react-router-dom";

import { UserData, AuthProvider } from "services/infrastructure/auth-service";
import { $T } from "i18n-strings";
import { Routes } from "./routes";

import { PageHeader } from "./_generic/page-header";
import { InfoBox } from "./_generic/info-box";
import { SvgBtnGoogle } from "./_images/svg-btn-google";
import { MainMenuContainer } from "./main-menu.container";

interface State {}

interface Props {
  user: UserData;
  onSignIn(authProvider: AuthProvider): void;
}

export class LoginPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  renderAuthProviderInfo(provider: AuthProvider) {
    switch (provider) {
      case AuthProvider.google:
        return (
          <span className="icon">
            <SvgBtnGoogle />
          </span>
        );
      case AuthProvider.none:
        return <></>;
      default:
        throw new Error("Auth provider is not known");
    }
  }

  handleOnSignInClick = () => {
    this.props.onSignIn(AuthProvider.google);
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <br />

            <div className="columns">
              <div className="column" />
              <div className="column">
                {!this.props.user.isLoggedIn && this.renderLoginForm()}
                {this.props.user.isLoggedIn && this.renderWelcomeForm()}
              </div>
              <div className="column" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderLoginForm() {
    return (
      <>
        <PageHeader title={$T.login.title} />
        <br />
        <InfoBox content={$T.login.notLoggedInSignInMessage} />
        <br />

        <div key="login-elem-google">
          <button
            type="button"
            className="button"
            style={{ width: "100%" }}
            onClick={this.handleOnSignInClick}
          >
            &nbsp; &nbsp;
            <span className="icon">
              <SvgBtnGoogle />
            </span>
            &nbsp; &nbsp;
            <span>{$T.common.signInWithGoogle}</span>
            &nbsp; &nbsp;
          </button>
        </div>
      </>
    );
  }

  renderWelcomeForm() {
    return (
      <>
        <PageHeader title={$T.welcome.title} />
        <br />
        <div className="media">
          {this.props.user.imageUrl && (
            <div className="media-left">
              <figure className="image is-48x48">
                <img src={this.props.user.imageUrl} alt="User image" />
              </figure>
            </div>
          )}

          <div className="media-content">
            <p className="title is-5 is-marginless">{this.props.user.name}</p>
            <p>{this.props.user.email}</p>
            <p>{this.renderAuthProviderInfo(this.props.user.authProvider)}</p>
          </div>
        </div>

        <br />

        <Link to={Routes.gallery.build({})}>
          <InfoBox
            iconClass="far fa-images"
            content={
              <>
                <h2>{$T.welcome.galleryLinkHeader}</h2>
                <p>{$T.welcome.galleryLinkDescription}</p>
              </>
            }
          />
        </Link>
        <br />
        <Link to={Routes.tutorials.build({})}>
          <InfoBox
            iconClass="fas fa-graduation-cap"
            content={
              <>
                <h2>{$T.welcome.tutorialsLinkHeader}</h2>
                <p>{$T.welcome.tutorialsLinkDescription}</p>
              </>
            }
          />
        </Link>
        <br />
        <Link to={Routes.playgroundDefault.build({})}>
          <InfoBox
            iconClass="fas fa-code"
            content={
              <>
                <h2>{$T.welcome.playgroundLinkHeader}</h2>
                <p>{$T.welcome.playgroundLinkDescription}</p>
              </>
            }
          />
        </Link>
        <br />
      </>
    );
  }
}
