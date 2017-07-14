import * as React from "react";
import * as cn from "classnames";

import "./progress-indicator.component.scss";

interface IComponentProps {
  isLoading?: boolean;
  className?: string;
}

export class ProgressIndicatorComponent extends React.Component<IComponentProps, void> {
  render(): JSX.Element | null {
    if (this.props.isLoading) {
      return (
        <div className={cn("ex-loading-indicator", this.props.className)}>
          <div className="ex-animated-dot" />
          <div className="ex-animated-dot" />
          <div className="ex-animated-dot" />
        </div>
      );
    }
    return null;
  }
}
