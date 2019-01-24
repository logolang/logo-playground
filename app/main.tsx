import * as React from "react";
import { HashRouter } from "react-router-dom";
import { RoutesComponent } from "app/routes.component";

interface Props {
  isLoading: boolean;
}
interface State {}

export class Main extends React.Component<Props, State> {
  private routerRef: HashRouter | null = null;

  render(): JSX.Element {
    return (
      <React.Fragment>
        <HashRouter ref={ref => (this.routerRef = ref)}>
          {!this.props.isLoading && <RoutesComponent />}
        </HashRouter>
      </React.Fragment>
    );
  }
}
