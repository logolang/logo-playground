import * as React from "react";

import { MainMenuContainer } from "./main-menu.container";
import { SignInStatusContainer } from "./sign-in-status.container";

export class LoginPage extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content container">
          <br />
          <SignInStatusContainer />
        </div>
      </div>
    );
  }
}
