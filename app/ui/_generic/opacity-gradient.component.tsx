import * as React from "react";

import "./opacity-gradient.component.scss";

let bodyBackColor: string | null = "";

interface IComponentProps {
  className: string;
}

export class OpacityGradientComponent extends React.Component<IComponentProps, {}> {
  constructor() {
    super();

    bodyBackColor = bodyBackColor || window.getComputedStyle(document.body).backgroundColor;
  }

  render(): JSX.Element {
    return (
      <div
        className={`opacity-gradient ${this.props.className}`}
        style={{ boxShadow: `inset 0px -20px 20px -10px ${bodyBackColor}` }}
      />
    );
  }
}
