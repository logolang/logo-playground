import * as React from "react";

import "./message-toster.less";

export type TosterMessageType = "danger" | "info" | "success" | "warning" | "primary";

export interface TosterMessage {
  id: string;
  title?: string | JSX.Element;
  message: string | JSX.Element;
  type?: TosterMessageType;
  closeTimeout?: number;
}

interface Props {
  messages: TosterMessage[];
  onClose(id: string): void;
}

export class MessageToster extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  handleAlertDismiss = (message: TosterMessage) => {
    this.props.onClose(message.id);
  };

  render(): JSX.Element {
    return (
      <div className="message-toster">
        {this.props.messages.map(m => {
          return (
            <div key={m.id}>
              <article className={"message is-" + m.type}>
                <div className="message-header">
                  <p>{m.title}</p>
                  <button
                    className="delete"
                    aria-label="delete"
                    onClick={() => this.handleAlertDismiss(m)}
                  />
                </div>
                <div className="message-body">
                  <p>{m.message}</p>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    );
  }
}
