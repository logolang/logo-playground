import * as React from "react";
import * as cn from "classnames";

import { _T } from "app/services/customizations/localization.service";
import { IProgramToSaveAttributes } from "app/services/program/program-management.service";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { NoDataComponent } from "app/ui/_generic/no-data.component";

interface IComponentState {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
}

interface IComponentProps {
  programName: string;
  screenshot: string;
  onSave(programName: string): Promise<void>;
  allowRename: boolean;
  onClose(): void;
}

export class SaveProgramModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programName,
      isSavingInProgress: false
    };
  }

  render(): JSX.Element | null {
    return (
      <ModalComponent
        show
        title={_T("Save your program to Gallery")}
        onConfirm={this.saveProgramAction}
        onCancel={this.props.onClose}
        actionButtonText={_T("Save")}
        cancelButtonText={_T("Cancel")}
      >
        <div className="field">
          <label className="label">{_T("Program name")}</label>
          <div className="control">
            <input
              type="text"
              readOnly={!this.props.allowRename}
              disabled={!this.props.allowRename}
              className={cn("input", { "is-danger": !!this.state.errorMessage })}
              id="program-name-in-save-dialog"
              placeholder={_T("Please enter the name for your program")}
              autoFocus
              value={this.state.programName}
              onChange={event => {
                if (this.props.allowRename) {
                  this.setState({ programName: event.target.value });
                }
              }}
              onKeyDown={async event => {
                if (event.which == 13) {
                  event.preventDefault();
                  await this.saveProgramAction();
                }
              }}
            />
            {this.state.errorMessage && <p className="help is-danger">{this.state.errorMessage}</p>}
          </div>
        </div>
        <div className="field">
          <label className="label">{_T("Gallery image")}</label>
          <div className="has-text-centered">
            <div className="box is-inline-block">
              {this.props.screenshot ? (
                <figure className="has-text-centered">
                  <img src={this.props.screenshot} />
                </figure>
              ) : (
                <NoDataComponent iconClass="fa-picture-o" title={_T("No image")} />
              )}
            </div>
          </div>
        </div>
      </ModalComponent>
    );
  }

  saveProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });
    const attrs: IProgramToSaveAttributes = {
      name: this.state.programName,
      programId: ""
    };

    try {
      await this.props.onSave(this.state.programName);
      this.props.onClose();
    } catch (ex) {
      const message = ex.toString();

      this.setState({
        isSavingInProgress: false,
        errorMessage: message
      });
    }
  };
}
