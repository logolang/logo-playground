import * as React from "react";
import { ReactGoldenLayoutHelperContext } from "./react-golden-layout-context";
import { GoldenLayoutHelper } from "./golden-layout.helper";

export interface Props {
  id: string;
  title: string;
}

export class ReactGoldenLayoutPanel extends React.Component<Props, {}> {
  private layoutHelper?: GoldenLayoutHelper;

  componentDidUpdate(prevProps: Props) {
    if (this.props.title != prevProps.title && this.layoutHelper) {
      this.layoutHelper.setPanelTitle(this.props.id, this.props.title);
    }
  }

  render() {
    return (
      <ReactGoldenLayoutHelperContext.Consumer>
        {context => {
          this.layoutHelper = context;
          return this.props.children;
        }}
      </ReactGoldenLayoutHelperContext.Consumer>
    );
  }
}
