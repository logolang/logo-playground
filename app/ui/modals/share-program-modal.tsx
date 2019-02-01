import * as React from "react";

import { $T } from "app/i18n-strings";
import { resolve } from "app/di";
import { ErrorDef, callActionSafe } from "app/utils/error";

import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { EventsTrackingService, EventAction } from "app/services/env/events-tracking.service";

import { AlertMessage } from "app/ui/_generic/alert-message";
import { Modal } from "app/ui/_generic/modal";
import { InputCopyToClipboard } from "app/ui/_generic/input-copy-to-clipboard";

interface State {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
  publishedUrl: string;
}

interface Props {
  programName: string;
  programCode: string;
  imageBase64: string;
  onClose(): void;
}

export class ShareProgramModal extends React.Component<Props, State> {
  private gistService = resolve(GistSharedProgramsRepository);
  private eventsTracking = resolve(EventsTrackingService);

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programName,
      isSavingInProgress: false,
      publishedUrl: ""
    };
  }

  private errorHandler = (err: ErrorDef) => {
    this.setState({ errorMessage: err.message });
  };

  render(): JSX.Element | null {
    return (
      <Modal
        show
        title={$T.program.shareYourProgram}
        onConfirm={this.state.publishedUrl ? undefined : this.shareProgramAction}
        onCancel={this.props.onClose}
        withoutFooter={!!this.state.publishedUrl}
        actionButtonText={$T.common.continue}
        cancelButtonText={$T.common.cancel}
      >
        {this.state.errorMessage && (
          <div>
            <AlertMessage message={this.state.errorMessage} />
            <br />
          </div>
        )}

        <div className="field">
          <label className="label">{$T.program.programName}</label>
          <div className="control">
            <input
              readOnly={!!this.state.publishedUrl}
              type="text"
              className="input"
              id="program-name-in-share-dialog"
              placeholder={$T.program.pleaseEnterNameForYourProgram}
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
            <label className="label">{$T.program.publicUrl}</label>
            <InputCopyToClipboard text={this.state.publishedUrl} />
          </div>
        )}
      </Modal>
    );
  }

  shareProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });

    const result = await callActionSafe(this.errorHandler, async () =>
      this.gistService.post(this.state.programName, this.props.programCode)
    );
    this.setState({
      isSavingInProgress: false
    });
    if (result) {
      this.eventsTracking.sendEvent(EventAction.shareProgramToGist);
      this.setState({
        publishedUrl: result
      });
    }
  };
}
