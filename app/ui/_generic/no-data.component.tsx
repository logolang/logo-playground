import * as React from "react";
import * as cn from "classnames";

import "./no-data.component.less";

interface IComponentProps {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  iconClass?: string;
}

export class NoDataComponent extends React.Component<IComponentProps, {}> {
  render(): JSX.Element {
    const iconClass = this.props.iconClass || "fa-picture-o";

    return (
      <div className="no-data-component has-text-centered">
        <span className="icon is-large">
          <i className={"fa " + iconClass} aria-hidden="true" />
        </span>
        {this.props.title && <h2 className="subtitle">{this.props.title}</h2>}
        {this.props.description && <p>{this.props.description}</p>}
      </div>
    );
  }
}
