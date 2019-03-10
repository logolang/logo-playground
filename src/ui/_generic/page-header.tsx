import * as React from "react";

interface State {}

interface Props {
  title: JSX.Element | string;
}

export class PageHeader extends React.Component<Props, State> {
  render(): JSX.Element {
    return <h1 className="title">{this.props.title}</h1>;
  }
}
