import * as React from "react";

import { $T } from "app/i18n/strings";

import { ModalComponent } from "app/ui/_generic/modal.component";
import { ProgramModel } from "app/services/program/program.model";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { NoDataComponent } from "app/ui/_generic/no-data.component";

interface IComponentState {
  errorMessage: string;
  isDeleteInProgress: boolean;
}

interface IComponentProps {
  program: ProgramModel;
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
    const p = this.props.program;
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
              value={this.props.program.name}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">{$T.gallery.editedDate}</label>
          <div className="control">
            <input
              type="text"
              readOnly
              className="input"
              id="program-edited-in-delete-dialog"
              value={new Date(this.props.program.dateLastEdited).toLocaleDateString()}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">{$T.gallery.galleryImage}</label>
          <div className="has-text-centered">
            <div className="box is-inline-block">
              {this.props.program.screenshot ? (
                <figure className="has-text-centered">
                  <img src={this.props.program.screenshot} />
                </figure>
              ) : (
                <NoDataComponent iconClass="fa-picture-o" title={$T.gallery.noImage} />
              )}
            </div>
          </div>
        </div>
      </ModalComponent>
    );
  }
}
