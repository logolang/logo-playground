import * as cn from "classnames";
import * as React from "react";

interface ICollapsiblePanelComponentState {
  panelHeight: string;
}

export interface ICollapsiblePanelComponentProps {
  isCollapsed?: boolean;
  className?: string;
}

/**
 * Component to render collapsible panel
 */
export class CollapsiblePanelComponent extends React.Component<
  ICollapsiblePanelComponentProps,
  ICollapsiblePanelComponentState
> {
  readonly animationDuration = 300;
  resizeTimeoutHandle: any = undefined;

  constructor(props: ICollapsiblePanelComponentProps) {
    super(props);
    this.state = {
      panelHeight: "auto"
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    if (this.resizeTimeoutHandle) {
      clearTimeout(this.resizeTimeoutHandle);
    }
    this.resizeTimeoutHandle = setTimeout(this.handleResize, 500);
  };

  handleResize = () => {
    const panelInnerDiv = this.refs["panelBodyInner"] as HTMLElement;
    const panelHeight = this.props.isCollapsed ? "0px" : panelInnerDiv.scrollHeight + "px";
    if (this.state.panelHeight != panelHeight) {
      this.setState({ panelHeight });
    }
  };

  componentDidUpdate() {
    this.handleResize();

    /**
     *  This is to handle rare situation when initial size was calculated
     *  without scrollbar, but after actual resizing the scroll bar appears
     *  and affects the size of content. So here is the delay of used animation length
     */
    setTimeout(this.handleResize, this.animationDuration);
  }

  render(): JSX.Element {
    return (
      <div
        className={cn("collapsible-panel-component", this.props.className)}
        style={{
          height: this.state.panelHeight,
          transition: "height " + this.animationDuration / 1000 + "s",
          overflow: "hidden"
        }}
      >
        <div className="collapsible-panel-inner" ref="panelBodyInner">
          {this.props.children}
        </div>
      </div>
    );
  }
}
