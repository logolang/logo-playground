import * as React from "react";
import { $T } from "app/i18n/strings";
import { AuthProvider } from "app/store/user/state.user";

interface State {}

interface Props {
  userName: string;
  userImageUrl: string;
  userEmail: string;
  isLoggedIn: boolean;
  authProvider: AuthProvider;
  onSignIn(authProvider: AuthProvider): void;
}

export class SignInStatus extends React.Component<Props, State> {
  getAuthProviderIcon(provider: AuthProvider) {
    switch (provider) {
      case AuthProvider.google:
        return (
          <>
            <i className="fab fa-google" aria-hidden="true" />
            &nbsp;
          </>
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
      <div>
        <div className="media">
          {this.props.userImageUrl && (
            <div className="media-left">
              <figure className="image is-48x48">
                <img src={this.props.userImageUrl} alt="User image" />
              </figure>
            </div>
          )}

          <div className="media-content">
            <p className="title is-5 is-marginless">
              {this.props.userName || $T.settings.userGuestNickName}
            </p>
            <p>{this.props.userEmail}</p>
            {this.props.isLoggedIn ? (
              <>
                <p>
                  <span className="tag is-primary is-medium">
                    {this.getAuthProviderIcon(this.props.authProvider)} {this.props.authProvider}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p>{$T.gallery.notLoggedInText}</p>

                <div key="login-elem-google">
                  <button
                    type="button"
                    className="button is-info"
                    onClick={this.handleOnSignInClick}
                  >
                    <span className="icon">
                      <i className="fab fa-google" aria-hidden="true" />
                    </span>
                    <span>{$T.common.signInWithGoogle}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
