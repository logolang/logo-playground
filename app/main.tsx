import * as React from "react";
import { HashRouter } from "react-router-dom";
import { Subscription } from "rxjs";
import { Provider } from "react-redux";

import { resolveInject } from "app/di";
import { store } from "./store/store";
import { RandomHelper } from "app/utils/random-helper";
import { MessageToster } from "app/ui/_generic/message-toster";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { Routes, RoutesComponent } from "app/routes";
import { DependecyInjectionSetupService } from "app/di-setup";
import { ErrorService } from "app/services/infrastructure/error.service";

interface State {
  renderKey: string;
}

export class Main extends React.Component<{}, State> {
  private navigationService = resolveInject(NavigationService);
  private notificationService = resolveInject(NotificationService);
  private errorService = resolveInject(ErrorService);
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

    this.errorService.getObservable().subscribe(err => {
      this.notificationService.push({ message: err.message, type: "danger" });
    });
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <React.Fragment key={this.state.renderKey}>
          <MessageToster events={this.notificationService.getObservable()} />
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
      </Provider>
    );
  }
}
