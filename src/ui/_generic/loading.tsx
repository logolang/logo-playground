import * as React from "react";

import "./loading.less";

interface Props {
  isLoading?: boolean;
  fullPage?: boolean;
}

export class Loading extends React.Component<Props> {
  private loadingContainer?: HTMLElement;

  componentDidMount() {
    this.startAnimation();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isLoading != this.props.isLoading) {
      this.startAnimation();
    }
  }

  startAnimation() {
    if (this.props.isLoading) {
      (window as any).showLogoAnimation(this.loadingContainer);
    }
  }

  render() {
    if (!this.props.isLoading) {
      return <></>;
    }

    if (this.props.fullPage) {
      return (
        <div className="ex-loading-indicator-fullpage">
          <div
            ref={ref => (this.loadingContainer = ref || undefined)}
            className="ex-loading-indicator"
          ></div>
        </div>
      );
    }
    return (
      <div
        ref={ref => (this.loadingContainer = ref || undefined)}
        className="ex-loading-indicator"
      ></div>
    );
  }
}
