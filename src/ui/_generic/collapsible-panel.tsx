import * as cn from "classnames";
import * as React from "react";
import { debounce } from "utils/debounce";

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
  private panelBodyInnerRef: HTMLDivElement | null;
  private panelBodyOuterRef: HTMLDivElement | null;

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
    if (!this.panelBodyInnerRef) {
      throw new Error("Failed to get panelBodyInnerRef ref");
    }
    const panelHeight = this.props.isCollapsed ? "0px" : this.panelBodyInnerRef.scrollHeight + "px";
    if (this.state.panelHeight != panelHeight) {
      this.setState({ panelHeight });
    }
  };

  componentDidUpdate(prevProps: Props) {
    if (!this.panelBodyOuterRef) {
      throw new Error("Failed to get panelBodyInnerRef ref");
    }
    if (this.props.isCollapsed && !prevProps.isCollapsed) {
      this.panelBodyOuterRef.style.height = this.panelBodyOuterRef.scrollHeight + "px";
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
        ref={ref => (this.panelBodyOuterRef = ref)}
        style={{
          height: this.state.panelHeight,
          transition: "height " + this.animationDuration / 1000 + "s",
          overflow: "hidden"
        }}
      >
        <div className="collapsible-panel-inner" ref={ref => (this.panelBodyInnerRef = ref)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
