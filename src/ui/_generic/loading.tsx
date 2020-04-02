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

  const renderLoader = () => (
    <div className="ex-loading-indicator">{React.createElement("logo-animation")}</div>
  );

  if (props.fullPage) {
    return <div className="ex-loading-indicator-fullpage">{renderLoader()}</div>;
  }
  return renderLoader();
}
