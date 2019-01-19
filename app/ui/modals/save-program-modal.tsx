import * as React from "react";
import * as cn from "classnames";

import { $T } from "app/i18n/strings";

import { Modal } from "app/ui/_generic/modal";
import { NoData } from "app/ui/_generic/no-data";

interface State {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
}

interface Props {
  programName: string;
  screenshot: string;
  onSave(programName: string): Promise<void>;
  allowRename: boolean;
  onClose(): void;
}

export class SaveProgramModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programName,
      isSavingInProgress: false
    };
  }

  render(): JSX.Element | null {
    return (
      <Modal
        show
        title={$T.program.saveToLibrary}
        onConfirm={this.saveProgramAction}
        onCancel={this.props.onClose}
        actionButtonText={$T.common.save}
        cancelButtonText={$T.common.cancel}
      >
        <div className="field">
          <label className="label">{$T.program.programName}</label>
          <div className="control">
            <input
              type="text"
              readOnly={!this.props.allowRename}
              disabled={!this.props.allowRename}
              className={cn("input", {
                "is-danger": !!this.state.errorMessage
              })}
              id="program-name-in-save-dialog"
              placeholder={$T.program.pleaseEnterNameForYourProgram}
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
          <label className="label">{$T.gallery.galleryImage}</label>
          <div className="has-text-centered">
            <div className="box is-inline-block">
              {this.props.screenshot ? (
                <figure className="has-text-centered">
                  <img src={this.props.screenshot} />
                </figure>
              ) : (
                <NoData iconClass="fa-picture-o" title={$T.gallery.noImage} />
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  saveProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });

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
