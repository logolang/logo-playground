import * as React from "react";

import { MainMenu } from "app/ui/main-menu";
import { resolveInject } from "app/di";
import { $T } from "app/i18n/strings";
import { TitleService } from "app/services/infrastructure/title.service";
import { SignInStatus } from "app/ui/sign-in-status";

export class LoginPage extends React.Component<{}, {}> {
  private titleService = resolveInject(TitleService);

  constructor(props: {}) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle($T.common.signIn);
  }

  render(): JSX.Element {
    return (
      <div>
        <MainMenu />
        <div className="container">
          <br />
          <SignInStatus />
        </div>
      </div>
    );
  }
}
