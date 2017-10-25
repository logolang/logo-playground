import * as React from "react";
import * as cn from "classnames";

import "./loading.component.scss";

interface IComponentProps {
  isLoading?: boolean;
  className?: string;
}

export class LoadingComponent extends React.Component<IComponentProps, {}> {
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
