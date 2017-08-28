import * as React from "react";
import { Collapse } from "react-bootstrap";
import { Observable, Subscription } from "rxjs/Rx";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

import "./message-toster.component.scss";

type TosterMessageType = "danger" | "info" | "success" | "warning";

interface ITosterMessage {
  title?: string | JSX.Element;
  message: string | JSX.Element;
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
  offsetLeft: number;
}

export class MessageTosterComponent extends React.Component<IComponentProps, IComponentState> {
  private messageSubscription: Subscription | undefined;
  private id: number = 1;

  constructor(props: IComponentProps) {
    super(props);
    this.state = {
      messages: [],
      offsetLeft: 40
    };
  }

  componentDidMount() {
    this.messageSubscription = this.props.events.subscribe(this.onMessage);
  }

  onMessage = (message: ITosterMessage) => {
    let offsetLeft = this.state.offsetLeft;
    const container = window.document.querySelector(".container") as HTMLElement;
    if (container) {
      offsetLeft = container.offsetLeft;
    }

    console.log("got a message!", message);
    const newMessageData: IMessageData = {
      id: (++this.id).toString(),
      message: message,
      open: false
    };
    this.setState(s => ({ messages: [...s.messages, newMessageData], offsetLeft: offsetLeft }));
    if (message.closeTimeout) {
      setTimeout(this.handleAlertDismiss(newMessageData), message.closeTimeout);
    }

    setTimeout(() => {
      newMessageData.open = true;
      this.setState(s => s);
    }, 0);
  };

  handleAlertDismiss = (message: IMessageData) => {
    return () => {
      message.open = false;
      this.setState(s => s);
      setTimeout(() => {
        this.setState(s => ({ messages: s.messages.filter(m => m !== message) }));
      }, 400);
    };
  };

  componentWillUnmount() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  render(): JSX.Element {
    return (
      <div className="message-toster" style={{ left: this.state.offsetLeft + 12 + "px" }}>
        {this.state.messages.map(m => {
          return (
            <Collapse timeout={200} in={m.open} key={m.id}>
              <div>
                <AlertMessageComponent
                  onDismiss={this.handleAlertDismiss(m)}
                  type={m.message.type}
                  title={m.message.title}
                  message={m.message.message}
                />
              </div>
            </Collapse>
          );
        })}
      </div>
    );
  }
}
