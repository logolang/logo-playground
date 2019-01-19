import * as React from "react";

import "./no-data.less";

interface Props {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  iconClass?: string;
}

export class NoData extends React.Component<Props, {}> {
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
