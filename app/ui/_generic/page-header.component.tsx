import * as React from "react";

interface IPageHeaderComponentState {}

interface IPageHeaderComponentProps {
  title: JSX.Element | string;
}

export class PageHeaderComponent extends React.Component<IPageHeaderComponentProps, IPageHeaderComponentState> {
  render(): JSX.Element {
    return (
      <div>
        <h1>
          {this.props.title}
        </h1>
      </div>
    );
  }
}
