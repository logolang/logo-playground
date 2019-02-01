import * as React from "react";
import * as cn from "classnames";

import "./loading.less";

interface Props {
  isLoading?: boolean;
  fullPage?: boolean;
}

export function Loading(props: Props) {
  if (!props.isLoading) {
    return <></>;
  }

  if (props.fullPage) {
    return (
      <div className="ex-loading-indicator-fullpage">
        <div className="ex-loading-indicator">
          <div className="ex-animated-dot" />
          <div className="ex-animated-dot" />
          <div className="ex-animated-dot" />
        </div>
      </div>
    );
  }
  return (
    <div className="ex-loading-indicator">
      <div className="ex-animated-dot" />
      <div className="ex-animated-dot" />
      <div className="ex-animated-dot" />
    </div>
  );
}
