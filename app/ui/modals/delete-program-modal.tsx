import * as React from "react";

import { $T } from "app/i18n/strings";

import { Modal } from "app/ui/_generic/modal";
import { AlertMessage } from "app/ui/_generic/alert-message";

interface State {
  errorMessage: string;
  isDeleteInProgress: boolean;
}

interface Props {
  programName: string;
  onDelete(): void;
  onClose(): void;
}

export class DeleteProgramModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: "",
      isDeleteInProgress: false
    };
  }

  render(): JSX.Element | null {
    return (
      <Modal
        show
        onConfirm={this.handleConfirm}
        actionButtonText={$T.common.delete}
        cancelButtonText={$T.common.cancel}
        title={$T.common.areYouSure}
        onCancel={this.props.onClose}
      >
        <AlertMessage title={$T.program.youAreGoingToDeleteProgram} type="warning" />
        <br />
        <div className="field">
          <label className="label">{$T.program.programName}</label>
          <div className="control">
            <input
              type="text"
              readOnly
              className="input"
              id="program-name-in-delete-dialog"
              value={this.props.programName}
            />
          </div>
        </div>
      </Modal>
    );
  }

  handleConfirm = async () => {
    this.props.onDelete();
    this.props.onClose();
  };
}
