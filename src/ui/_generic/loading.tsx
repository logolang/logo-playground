import * as React from "react";

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
        <div
          className="ex-loading-indicator"
          dangerouslySetInnerHTML={{ __html: "<logo-animation />" }}
        ></div>
      </div>
    );
  }
  return (
    <div
      className="ex-loading-indicator"
      dangerouslySetInnerHTML={{ __html: "<logo-animation />" }}
    ></div>
  );
}
