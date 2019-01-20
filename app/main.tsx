import * as React from "react";
import { HashRouter } from "react-router-dom";
import { Subscription } from "rxjs";
import { Provider } from "react-redux";

import { resolveInject } from "app/di";
import { store } from "./store/store";
import { MessageToster } from "app/ui/_generic/message-toster";
import { NavigationService } from "app/services/infrastructure/navigation.service";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { RoutesComponent } from "app/routes.component";
import { DependecyInjectionSetupService } from "app/di-setup";
import { ErrorService } from "app/services/infrastructure/error.service";

interface State {
  renderIncrement: number;
}

export class Main extends React.Component<{}, State> {
  private navigationService = resolveInject(NavigationService);
  private notificationService = resolveInject(NotificationService);
  private errorService = resolveInject(ErrorService);
  private diService = resolveInject(DependecyInjectionSetupService);

  private navigationEventSubscription?: Subscription;
  private routerRef: HashRouter | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      renderIncrement: 1
    };
  }

  componentDidMount() {
    this.diService.onResetEvents.subscribe(() => {
      this.setState({ renderIncrement: this.state.renderIncrement + 1 });
    });

    this.errorService.getObservable().subscribe(err => {
      this.notificationService.push({ message: err.message, type: "danger" });
    });

    if (this.routerRef) {
      // Subscribe to navigation service to perform navigation via React Router
      this.navigationEventSubscription = this.navigationService.getObservable().subscribe(request => {
        (this.routerRef as any).history.push(request.route);
      });
    }
  }

  componentWillUnmount() {
    if (this.navigationEventSubscription) {
      this.navigationEventSubscription.unsubscribe();
    }
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <React.Fragment key={this.state.renderIncrement}>
          <MessageToster events={this.notificationService.getObservable()} />
          <HashRouter ref={ref => (this.routerRef = ref)}>
            <RoutesComponent />
          </HashRouter>
        </React.Fragment>
      </Provider>
    );
  }
}
