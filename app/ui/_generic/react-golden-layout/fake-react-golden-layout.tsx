import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  ReactGoldenLayoutPanel,
  ReactGoldenLayoutPanelProps
} from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";

interface IComponentState {
  activate: boolean;
}

interface IComponentProps {
  initConfigLayoutJSON: string;
  configLayoutOverride?: any;
}

export class FakeReactGoldenLayout extends React.Component<IComponentProps, IComponentState> {
  elements: (HTMLElement | null)[] = [];

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      activate: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ activate: true });
    }, 100);
  }

  render(): JSX.Element {
    return (
      <div className="container">
        <div className="columns">
          <div ref={x => (this.elements[0] = x)} className="column" style={{ width: 600 }} />
          <div ref={x => (this.elements[1] = x)} className="column" style={{ width: 600 }} />
          {this.state.activate &&
            this.elements.length == 2 &&
            React.Children.map(this.props.children, (child, index) =>
              ReactDOM.createPortal(child, this.elements[index] as any)
            )}
        </div>
      </div>
    );
  }
}
