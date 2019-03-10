import * as React from "react";

interface Props {
  content?: JSX.Element | string;
  iconClass?: string;
}

export function InfoBox(props: Props) {
  return (
    <div className="box" style={{ maxWidth: 500 }}>
      <div className="media">
        <div className="media-left">
          <span className="icon is-large">
            <i className={"fa-3x " + (props.iconClass || "fas fa-info")} />
          </span>
        </div>
        <div className="media-content">
          <div className="content">
            {typeof props.content === "string" ? <p>{props.content}</p> : <>{props.content}</>}
          </div>
        </div>
      </div>
    </div>
  );
}
