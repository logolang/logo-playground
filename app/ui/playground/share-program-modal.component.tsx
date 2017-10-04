import * as React from "react";
import * as cn from "classnames";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { InputCopyToClipboardComponent } from "app/ui/_generic/input-copy-to-clipboard.component";

import { _T } from "app/services/customizations/localization.service";
import { IProgramToSaveAttributes } from "app/services/program/program-management.service";
import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { lazyInject } from "app/di";
import { ProgramModel } from "app/services/program/program.model";
import { handleAsyncError } from "app/utils/async-helpers";

interface IComponentState {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
  publishedUrl: string;
}

interface IComponentProps {
  programModel: ProgramModel;
  imageBase64: string;
  onClose(): void;
}

export class ShareProgramModalComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(GistSharedProgramsRepository) private gistService: GistSharedProgramsRepository;

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programModel.name,
      isSavingInProgress: false,
      publishedUrl: ""
    };
  }

  render(): JSX.Element | null {
    return (
      <ModalComponent
        show
        title={_T("Share your program")}
        onConfirm={this.state.publishedUrl ? undefined : this.saveProgramAction}
        onCancel={this.props.onClose}
        actionButtonText={_T("Continue")}
        cancelButtonText={this.state.publishedUrl ? _T("Close") : _T("Cancel")}
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
              readOnly={!!this.state.publishedUrl}
              type="text"
              className="input"
              id="program-name-in-share-dialog"
              placeholder={_T("Please enter the name for your program")}
              autoFocus
              value={this.state.programName}
              onChange={event => {
                this.setState({ programName: event.target.value });
              }}
            />
          </div>
        </div>
        <br />
        {this.state.publishedUrl && (
          <div>
            <label className="label">{_T("Public url")}</label>
            <InputCopyToClipboardComponent text={this.state.publishedUrl} />
          </div>
        )}
      </ModalComponent>
    );
  }

  saveProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });

    try {
      const result = await this.gistService.post(
        this.state.programName,
        this.props.imageBase64,
        this.props.programModel
      );
      this.setState({
        publishedUrl: result
      });
    } catch (ex) {
      const error = await handleAsyncError(ex);
      this.setState({
        isSavingInProgress: false,
        errorMessage: error.message
      });
    }
  };
}
