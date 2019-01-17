import * as React from "react";

import { $T } from "app/i18n/strings";

import { ModalComponent } from "app/ui/_generic/modal.component";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

interface IComponentState {
  errorMessage: string;
  isDeleteInProgress: boolean;
}

interface IComponentProps {
  programName: string;
  onDelete(): Promise<void>;
  onClose(): void;
}

export class DeleteProgramModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      isDeleteInProgress: false
    };
  }

  render(): JSX.Element | null {
    return (
      <ModalComponent
        show
        onConfirm={this.props.onDelete}
        actionButtonText={$T.common.delete}
        cancelButtonText={$T.common.cancel}
        title={$T.common.areYouSure}
        onCancel={this.props.onClose}
      >
        <AlertMessageComponent title={$T.program.youAreGoingToDeleteProgram} type="warning" />
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
      </ModalComponent>
    );
  }
}
