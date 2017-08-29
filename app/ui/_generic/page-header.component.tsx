import * as React from "react";

interface IPageHeaderComponentState {}

interface IPageHeaderComponentProps {
  title: JSX.Element | string;
}

export class PageHeaderComponent extends React.Component<IPageHeaderComponentProps, IPageHeaderComponentState> {
  render(): JSX.Element {
    return (
      <h1 className="title">
        {this.props.title}
      </h1>
    );
  }
}
