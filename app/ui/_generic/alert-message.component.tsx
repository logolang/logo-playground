import * as React from "react";

import "./alert-message.component.scss";

type messageType = "primary" | "info" | "danger" | "warning" | "success";

interface IComponentProps {
  type?: messageType;
  title?: JSX.Element | string;
  message?: JSX.Element | string;
  doNotDetectPreformatted?: boolean;
  onDismiss?: () => void;
}

export class AlertMessageComponent extends React.Component<IComponentProps, {}> {
  render(): JSX.Element | null {
    const type = this.props.type || "danger";
    let message = this.props.message || "";
    let title = this.props.title;
    const preformatted =
      typeof message == "string" && !this.props.doNotDetectPreformatted
        ? message.includes("<") || message.includes("{") || message.includes("[")
        : false;

    if (type === "danger" && !title && message && message.toString().startsWith("Error: ")) {
      title = "Error";
      message = message.toString().substr(7);
    }

    if (message || title) {
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
    return null;
  }
}
