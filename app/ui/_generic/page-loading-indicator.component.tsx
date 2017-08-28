import * as React from "react";
import * as cn from "classnames";

import "./page-loading-indicator.component.scss";
import { ProgressIndicatorComponent } from "app/ui/_generic/progress-indicator.component";

interface IComponentProps {
  isLoading: boolean;
  className?: string;
}

export class PageLoadingIndicatorComponent extends React.Component<IComponentProps, {}> {
  render(): JSX.Element | null {
    return (
      <div className={this.props.className}>
        <ProgressIndicatorComponent isLoading={this.props.isLoading} className="ex-page-loading-indicator" />
        <div className={cn("ex-page-content", { "is-visible": !this.props.isLoading })}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
