import * as React from "react";
import { HashRouter } from "react-router-dom";
import { RoutesComponent } from "./routes.component";
import { NavigationService } from "services/navigation.service";
import { MessageToster, TosterMessage } from "ui/_generic/message-toster";
import { Loading } from "ui/_generic/loading";

interface Props {
  isLoading: boolean;
  tosterMessages: TosterMessage[];
  onTosterMessageClose(id: string): void;
}
interface State {}

export class Main extends React.Component<Props, State> {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <MessageToster
          messages={this.props.tosterMessages}
          onClose={this.props.onTosterMessageClose}
        />
        <Loading isLoading={this.props.isLoading} fullPage />
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
