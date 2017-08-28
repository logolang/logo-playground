import * as React from "react";
import * as cn from "classnames";

interface IComponentState {
  isActionInProgress: boolean;
  errorMessage: string;
}

interface IComponentProps {
  show: boolean;
  headerText?: string;
  onCancel(): void;
  onConfirm(): Promise<IDialogCallbackResult>;
  actionButtonText?: JSX.Element | string;
  cancelButtonText?: JSX.Element | string;
}

export interface IDialogCallbackResult {
  errorMessage?: string;
  isSuccess: boolean;
}

export class ActionConfirmationModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      isActionInProgress: false
    };
  }

  render(): JSX.Element {
    const headerText = this.props.headerText || "Are you sure?";
    const actionButtonText = this.props.actionButtonText || "Delete";
    const cancelButtonText = this.props.cancelButtonText || "Cancel";
    return (
      <div data-show={this.props.show}>
        <button type="button" onClick={this.props.onCancel}>
          X
        </button>
        <h4>
          {headerText}
        </h4>
        <div>
          {this.props.children}
          {this.state.errorMessage &&
            <div>
              <br />
              <div className="alert alert-danger" role="alert">
                {this.state.errorMessage}
              </div>
            </div>}
          <br />
        </div>
        <div>
          <button
            type="button"
            className={cn("btn btn-primary", { "is-loading": this.state.isActionInProgress })}
            onClick={async () => {
              this.setState({ isActionInProgress: true, errorMessage: "" });
              try {
                const result = await this.props.onConfirm();
                this.setState({ isActionInProgress: false, errorMessage: result.errorMessage || "" });
              } catch (ex) {
                this.setState({ isActionInProgress: false, errorMessage: ex.toString() });
              }
            }}
          >
            <span>
              {actionButtonText}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-link"
            onClick={() => {
              if (!this.state.isActionInProgress) {
                this.props.onCancel();
              }
            }}
          >
            <span>
              {cancelButtonText}
            </span>
          </button>
        </div>
      </div>
    );
  }
}
