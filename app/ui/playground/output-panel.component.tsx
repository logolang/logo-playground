import * as React from "react";

import { LogoExecutorComponent, ILogoExecutorComponentProps } from "app/ui/_shared/logo-executor.component";

import "./output-panel.component.less";

interface IComponentState {}

export interface IOutputPanelComponentProps {
  logoExecutorProps: ILogoExecutorComponentProps;
}

export class OutputPanelComponent extends React.Component<IOutputPanelComponentProps, IComponentState> {
  constructor(props: IOutputPanelComponentProps) {
    super(props);

    this.state = {};
  }

  render(): JSX.Element {
    return (
      <div className="output-container">{React.createElement(LogoExecutorComponent, this.props.logoExecutorProps)}</div>
    );
  }
}
