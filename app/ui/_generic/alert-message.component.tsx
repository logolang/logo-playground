import * as React from "react";

import "./alert-message.component.scss";

type messageType = "info" | "danger" | "warning" | "success";

interface IComponentProps {
  type?: messageType;
  title?: JSX.Element | string;
  message?: JSX.Element | string;
  doNotDetectPreformatted?: boolean;
  onDismiss?: () => void;
}

export class AlertMessageComponent extends React.Component<IComponentProps, {}> {
  private getIconClass(type: messageType) {
    switch (type) {
      case "info":
        return "glyphicon-info-sign";
      case "success":
        return "glyphicon glyphicon-ok-sign";
      case "danger":
        return "glyphicon-exclamation-sign";
      case "warning":
        return "glyphicon-exclamation-sign";
    }
  }

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
        <div className={`ex-customized-alert`}>
          <div className="media ex-margin-top-zero">
            <div className="media-left">
              <span className="text-nowrap">
                <span className={`ex-icon-container glyphicon ${this.getIconClass(type)}`} aria-hidden="true" />
                <span>&nbsp;</span>
              </span>
            </div>
            <div className="media-body ex-vertical-align-middle">
              {title &&
                <h4 className="media-heading ex-margin-zero">
                  <span>
                    {title}
                  </span>
                </h4>}
              {title && message && <p />}
              {message &&
                (preformatted
                  ? <pre>
                      {message}
                    </pre>
                  : message)}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}
