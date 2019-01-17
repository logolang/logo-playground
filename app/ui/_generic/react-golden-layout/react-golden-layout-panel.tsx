import * as React from "react";
import { ReactGoldenLayoutHelperContext } from "./react-golden-layout-context";
import { GoldenLayoutHelper } from "./golden-layout.helper";

export interface ReactGoldenLayoutPanelProps {
  id: string;
  title: string;
}

export class ReactGoldenLayoutPanel extends React.Component<ReactGoldenLayoutPanelProps, {}> {
  layoutHelper: GoldenLayoutHelper | undefined;

  constructor(props: ReactGoldenLayoutPanelProps) {
    super(props);
  }

  componentDidMount() {
    //TODO
  }

  componentWillReceiveProps(nextProps: ReactGoldenLayoutPanelProps) {
    if (this.props.title != nextProps.title) {
      if (this.layoutHelper) {
        this.layoutHelper.setPanelTitle(nextProps.id, nextProps.title);
      }
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
