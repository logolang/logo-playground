import * as React from "react";
import * as cn from "classnames";

import "./loading.component.less";

interface IComponentProps {
  isLoading?: boolean;
  className?: string;
  fullPage?: boolean;
}

export function LoadingComponent(props: IComponentProps) {
  if (!props.isLoading) {
    return <></>;
  }
  return (
    <div
      className={cn("ex-loading-indicator", props.className, {
        "ex-loading-indicator-fullpage": props.fullPage
      })}
    >
      <div className="ex-animated-dot" />
      <div className="ex-animated-dot" />
      <div className="ex-animated-dot" />
    </div>
  );
}
