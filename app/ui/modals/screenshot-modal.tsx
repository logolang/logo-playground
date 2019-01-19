import * as React from "react";

import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { AlertMessage } from "app/ui/_generic/alert-message";
import { Loading } from "app/ui/_generic/loading";
import { Modal } from "app/ui/_generic/modal";
import { InputCopyToClipboard } from "app/ui/_generic/input-copy-to-clipboard";

interface State {
  errorMessage: string;
  isSavingInProgress: boolean;
  imgUrl?: string;
}

interface Props {
  imageBase64: string;
  onClose(): void;
}

export class ScreenshotModal extends React.Component<Props, State> {
  private imageUploadService = resolveInject(ImageUploadService);
  private eventsTracking = resolveInject(EventsTrackingService);

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: "",
      isSavingInProgress: true
    };
  }

  async componentDidMount() {
    try {
      const link = await this.imageUploadService.doUpload(this.props.imageBase64);

      this.eventsTracking.sendEvent(EventAction.shareScreenshot);

      this.setState({
        isSavingInProgress: false,
        imgUrl: link
      });
    } catch (ex) {
      this.setState({
        isSavingInProgress: false,
        errorMessage: $T.common.error
      });
    }
  }

  render(): JSX.Element | null {
    return (
      <Modal
        show
        withoutFooter
        title={$T.program.screenshot}
        onCancel={this.props.onClose}
        cancelButtonText={$T.common.cancel}
      >
        <Loading isLoading={this.state.isSavingInProgress} />
        {this.state.errorMessage && <AlertMessage message={this.state.errorMessage} type="danger" />}
        {this.state.imgUrl && (
          <div className="share-screenshot-modal-component">
            <label className="label">{$T.program.imagePreview}</label>
            <div className="has-text-centered">
              <div className="box is-inline-block">
                <img className="screenshot-img" src={this.state.imgUrl} style={{ maxHeight: 400 }} />
              </div>
            </div>
            <br />
            <label className="label">{$T.program.imageUrl}</label>
            <InputCopyToClipboard text={this.state.imgUrl} />
          </div>
        )}
      </Modal>
    );
  }
}
