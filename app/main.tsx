import * as React from "react";
import { HashRouter } from "react-router-dom";
import { RoutesComponent } from "app/routes.component";
import { NavigationService } from "./services/env/navigation.service";

interface Props {
  isLoading: boolean;
}
interface State {}

export class Main extends React.Component<Props, State> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <HashRouter
          ref={(router: any) => {
            NavigationService.setNavigationHandler(route => {
              router && router.history.push(route);
            });
          }}
        >
          {!this.props.isLoading && <RoutesComponent />}
        </HashRouter>
      </React.Fragment>
    );
  }
}
