import * as React from "react";

import "./alert-message.component.less";

type messageType = "primary" | "info" | "danger" | "warning" | "success";

interface IComponentProps {
  type?: messageType;
  title?: JSX.Element | string;
  message?: JSX.Element | string;
  doNotDetectPreformatted?: boolean;
  onDismiss?(): void;
}

export function AlertMessageComponent(props: IComponentProps) {
  const type = props.type || "danger";
  let message = props.message || "";
  let title = props.title;
  if (!message && !title) {
    return <></>;
  }

  const preformatted =
    typeof message == "string" && !props.doNotDetectPreformatted
      ? message.includes("<") || message.includes("{") || message.includes("[")
      : false;

  if (type === "danger" && !title && message && message.toString().startsWith("Error: ")) {
    title = "Error";
    message = message.toString().substr(7);
  }

  return (
    <div className="alert-message-component">
      <article className={"message is-" + type}>
        <div className="message-body">
          {title && <p className="subtitle">{title}</p>}
          {message && (preformatted ? <pre>{message}</pre> : <p>{message}</p>)}
        </div>
      </article>
    </div>
  );
}
