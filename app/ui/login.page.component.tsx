import * as React from "react";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { resolveInject } from "app/di";
import { $T } from "app/i18n/strings";
import { TitleService } from "app/services/infrastructure/title.service";
import { SignInStatusComponent } from "app/ui/sign-in-status.component";

export class LoginPageComponent extends React.Component<{}, {}> {
  private titleService = resolveInject(TitleService);

  constructor(props: {}) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle($T.common.signIn);
  }

  render(): JSX.Element {
    return (
      <div>
        <MainMenuComponent />
        <div className="container">
          <br />
          <SignInStatusComponent />
        </div>
      </div>
    );
  }
}
