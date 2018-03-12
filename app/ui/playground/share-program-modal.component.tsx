import * as React from "react";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { ErrorDef, callActionSafe } from "app/utils/error-helpers";

import { GistSharedProgramsRepository } from "app/services/program/gist-shared-programs.repository";
import { ProgramModel } from "app/services/program/program.model";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { InputCopyToClipboardComponent } from "app/ui/_generic/input-copy-to-clipboard.component";

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
  private gistService = resolveInject(GistSharedProgramsRepository);
  private eventsTracking = resolveInject(IEventsTrackingService);

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programModel.name,
      isSavingInProgress: false,
      publishedUrl: ""
    };
  }

  private errorHandler = (err: ErrorDef) => {
    this.setState({ errorMessage: err.message });
  };

  render(): JSX.Element | null {
    return (
      <ModalComponent
        show
        title={_T("Share your program")}
        onConfirm={this.state.publishedUrl ? undefined : this.shareProgramAction}
        onCancel={this.props.onClose}
        withoutFooter={!!this.state.publishedUrl}
        actionButtonText={_T("Continue")}
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

  shareProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });

    const result = await callActionSafe(this.errorHandler, async () =>
      this.gistService.post(this.state.programName, this.props.imageBase64, this.props.programModel)
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
