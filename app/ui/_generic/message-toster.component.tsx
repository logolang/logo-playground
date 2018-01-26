import * as React from "react";
import { Observable, Subscription } from "rxjs/Rx";

import "./message-toster.component.less";

type TosterMessageType = "danger" | "info" | "success" | "warning" | "primary";

interface ITosterMessage {
  title?: string | JSX.Element;
  message: string | JSX.Element;
  detailedMessage?: string | JSX.Element;
  type?: TosterMessageType;
  closeTimeout?: number;
}

interface IMessageData {
  id: string;
  message: ITosterMessage;
  open: boolean;
}

interface IComponentProps {
  events: Observable<ITosterMessage>;
}

interface IComponentState {
  messages: IMessageData[];
}

export class MessageTosterComponent extends React.Component<IComponentProps, IComponentState> {
  private messageSubscription: Subscription | undefined;
  private id: number = 1;

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    this.messageSubscription = this.props.events.subscribe(this.onMessage);
  }

  onMessage = (message: ITosterMessage) => {
    console.log("got a message!", message);
    const newMessageData: IMessageData = {
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

  handleAlertDismiss = (message: IMessageData) => {
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
