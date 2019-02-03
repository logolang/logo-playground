import * as cn from "classnames";
import * as React from "react";
import { debounce } from "app/utils/debounce";

interface State {
  panelHeight: string;
}

export interface Props {
  isCollapsed?: boolean;
  className?: string;
}

/**
 * Component to render collapsible panel
 */
export class CollapsiblePanel extends React.Component<Props, State> {
  readonly animationDuration = 300;

  constructor(props: Props) {
    super(props);
    this.state = {
      panelHeight: this.props.isCollapsed ? "0px" : "auto"
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = debounce(() => {
    this.handleResize();
  }, 500);

  handleResize = () => {
    const panelInnerDiv = this.refs["panelBodyInner"] as HTMLElement;
    const panelHeight = this.props.isCollapsed ? "0px" : panelInnerDiv.scrollHeight + "px";
    if (this.state.panelHeight != panelHeight) {
      this.setState({ panelHeight });
    }
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.isCollapsed && !prevProps.isCollapsed) {
      if (this.props.isCollapsed) {
        const panelOuterDiv = this.refs["panelBodyOuter"] as HTMLElement;
        panelOuterDiv.style.height = panelOuterDiv.scrollHeight + "px";
      }
    }
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
        ref="panelBodyOuter"
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
