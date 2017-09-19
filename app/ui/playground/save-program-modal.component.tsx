import * as React from "react";
import * as cn from "classnames";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ModalComponent } from "app/ui/_generic/modal.component";

import { _T } from "app/services/customizations/localization.service";
import { IProgramToSaveAttributes } from "app/services/program/program-management.service";

interface IComponentState {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
}

interface IComponentProps {
  programName: string;
  onSave(programName: string): Promise<void>;
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
        {this.state.errorMessage && (
          <div>
            <AlertMessageComponent message={this.state.errorMessage} />
            <br />
          </div>
        )}

        <div className="field">
          <label className="label">{_T("Program name")}</label>
          <div className="control">
            <input
              type="text"
              className="input"
              id="program-name-in-save-dialog"
              placeholder={_T("Please enter the name for your program")}
              autoFocus
              value={this.state.programName}
              onChange={event => {
                this.setState({ programName: event.target.value });
              }}
              onKeyDown={async event => {
                if (event.which == 13) {
                  event.preventDefault();
                  await this.saveProgramAction();
                }
              }}
            />
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
