import * as React from "react";
import * as cn from "classnames";
import { AlertMessage } from "ui/_generic/alert-message";
import { callActionSafe } from "utils/error";

import "./modal.less";

interface State {
  isActionInProgress: boolean;
  errorMessage: string;
}

interface Props {
  show: boolean;
  withoutFooter?: boolean;
  title?: string;
  width?: "default" | "medium" | "wide";
  onCancel(): void;
  onConfirm?(): Promise<void>;
  actionButtonText?: JSX.Element | string;
  cancelButtonText?: JSX.Element | string;
}

export interface CallbackResult {
  errorMessage?: string;
  isSuccess: boolean;
}

export class Modal extends React.Component<Props, State> {
  private isComponentMounted = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: "",
      isActionInProgress: false
    };
  }

  componentDidMount() {
    this.isComponentMounted = true;
  }
  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  executeAction = async (): Promise<void> => {
    if (!this.props.onConfirm) {
      return;
    }
    this.setState({
      isActionInProgress: true
    });

    const result = await callActionSafe(
      err => {
        this.setState({
          isActionInProgress: false,
          errorMessage: err.message
        });
      },
      async () => {
        await this.props.onConfirm!();
        return true;
      }
    );

    if (result && this.isComponentMounted) {
      this.setState({
        isActionInProgress: false,
        errorMessage: ""
      });
    }
  };

  render(): JSX.Element | null {
    const headerText = this.props.title || "Are you sure?";
    const actionButtonText = this.props.actionButtonText || "Delete";
    const cancelButtonText = this.props.cancelButtonText || "Cancel";
    return (
      <div className={cn("modal modal-component", { " is-active": this.props.show })}>
        <div className="modal-background" onClick={this.props.onCancel} />
        <div
          className={cn("modal-card", {
            "is-medium": this.props.width === "medium",
            "is-wide": this.props.width === "wide"
          })}
        >
          <header className="modal-card-head">
            <p className="modal-card-title">{headerText}</p>
            <button className="delete" aria-label="close" onClick={this.props.onCancel} />
          </header>
          <section className={cn("modal-card-body")}>
            {this.props.children}
            {this.state.errorMessage && (
              <AlertMessage message={this.state.errorMessage} type="danger" />
            )}
          </section>
          {!this.props.withoutFooter && (
            <footer className="modal-card-foot">
              {this.props.onConfirm && (
                <button
                  className={cn("button is-primary", {
                    "is-loading": this.state.isActionInProgress
                  })}
                  onClick={this.executeAction}
                >
                  {actionButtonText}
                </button>
              )}
              <button
                className="button"
                onClick={() => {
                  if (!this.state.isActionInProgress) {
                    this.props.onCancel();
                  }
                }}
              >
                {cancelButtonText}
              </button>
            </footer>
          )}
        </div>
      </div>
    );
  }
}
