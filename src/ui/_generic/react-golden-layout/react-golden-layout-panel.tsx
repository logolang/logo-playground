import * as React from "react";
import { ReactGoldenLayoutHelperContext } from "./react-golden-layout-context";
import { GoldenLayoutHelper } from "./golden-layout.helper";

export interface Props {
  id: string;
  title: string;
}

export class ReactGoldenLayoutPanel extends React.Component<Props, {}> {
  private layoutHelper?: GoldenLayoutHelper;

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.title != nextProps.title && this.layoutHelper) {
      this.layoutHelper.setPanelTitle(nextProps.id, nextProps.title);
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
