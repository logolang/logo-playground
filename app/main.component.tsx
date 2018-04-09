import * as React from "react";
import { HashRouter } from "react-router-dom";

import { resolveInject } from "app/di";
import { MessageTosterComponent } from "app/ui/_generic/message-toster.component";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { RoutesComponent } from "app/routes";
import { DependecyInjectionSetupService } from "app/di-setup";
import { Subscription } from "rxjs";
import { RandomHelper } from "./utils/random-helper";

class IComponentState {
  renderKey: string;
}

export class MainComponent extends React.Component<{}, IComponentState> {
  private navigationService = resolveInject(INavigationService);
  private notificationService = resolveInject(INotificationService);
  private diService = resolveInject(DependecyInjectionSetupService);

  private navigationEventSubscription?: Subscription;

  constructor(props: {}) {
    super(props);
    this.state = {
      renderKey: RandomHelper.getRandomObjectId()
    };
  }

  componentDidMount() {
    this.diService.onResetEvents.subscribe(() => {
      this.setState({ renderKey: RandomHelper.getRandomObjectId() });
    });
  }

  render(): JSX.Element {
    return (
      <React.Fragment key={this.state.renderKey}>
        <MessageTosterComponent events={this.notificationService.getObservable()} />
        <HashRouter
          ref={(router: any) => {
            if (this.navigationEventSubscription) {
              this.navigationEventSubscription.unsubscribe();
            }
            if (router) {
              // Subscribe to navigation service to perform navigation via React Router
              this.navigationEventSubscription = this.navigationService.getObservable().subscribe(request => {
                router.history.push(request.route);
              });
            }
          }}
        >
          <RoutesComponent />
        </HashRouter>
      </React.Fragment>
    );
  }
}
