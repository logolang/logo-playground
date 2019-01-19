import * as React from "react";
import { Subscription, Observable } from "rxjs";

import "./message-toster.less";

type TosterMessageType = "danger" | "info" | "success" | "warning" | "primary";

interface TosterMessage {
  title?: string | JSX.Element;
  message: string | JSX.Element;
  detailedMessage?: string | JSX.Element;
  type?: TosterMessageType;
  closeTimeout?: number;
}

interface MessageData {
  id: string;
  message: TosterMessage;
  open: boolean;
}

interface Props {
  events: Observable<TosterMessage>;
}

interface State {
  messages: MessageData[];
}

export class MessageToster extends React.Component<Props, State> {
  private messageSubscription: Subscription | undefined;
  private id = 1;

  constructor(props: Props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    this.messageSubscription = this.props.events.subscribe(this.onMessage);
  }

  onMessage = (message: TosterMessage) => {
    const newMessageData: MessageData = {
      id: (++this.id).toString(),
      message: message,
      open: false
    };
    this.setState(s => ({ messages: [...s.messages, newMessageData] }));
    let closeTimeout = message.closeTimeout;
    if (closeTimeout === undefined) {
      closeTimeout = message.type === "danger" ? 0 : 3000;
    }
    if (closeTimeout) {
      setTimeout(this.handleAlertDismiss(newMessageData), closeTimeout);
    }

    setTimeout(() => {
      newMessageData.open = true;
      this.setState(s => s);
    }, 0);
  };

  handleAlertDismiss = (message: MessageData) => {
    return () => {
      this.setState(s => ({ messages: s.messages.filter(m => m !== message) }));
    };
  };

  componentWillUnmount() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  render(): JSX.Element {
    return (
      <div className="message-toster">
        {this.state.messages.map(m => {
          return (
            <div key={m.id}>
              <article className={"message is-" + m.message.type}>
                <div className="message-header">
                  <p>{m.message.title}</p>
                  <button className="delete" aria-label="delete" onClick={this.handleAlertDismiss(m)} />
                </div>
                <div className="message-body">
                  <p>{m.message.message}</p>
                  {m.message.detailedMessage && (
                    <p>
                      <strong>Details: </strong>
                      {m.message.detailedMessage}
                    </p>
                  )}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    );
  }
}