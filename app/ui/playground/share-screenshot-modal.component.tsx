import * as React from "react";

import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { InputCopyToClipboardComponent } from "app/ui/_generic/input-copy-to-clipboard.component";

import "./share-screenshot-modal.component.less";

interface IComponentState {
  errorMessage: string;
  isSavingInProgress: boolean;
  imgUrl?: string;
}

interface IComponentProps {
  imageBase64: string;
  onClose: () => void;
}

export class ShareScreenshotModalComponent extends React.Component<IComponentProps, IComponentState> {
  private imageUploadService = resolveInject(ImageUploadService);
  private eventsTracking = resolveInject(EventsTrackingService);

  constructor(props: IComponentProps) {
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
      <ModalComponent
        show
        withoutFooter
        title={$T.program.screenshot}
        onCancel={this.props.onClose}
        cancelButtonText={$T.common.cancel}
      >
        <LoadingComponent isLoading={this.state.isSavingInProgress} />
        {this.state.errorMessage && <AlertMessageComponent message={this.state.errorMessage} type="danger" />}
        {this.state.imgUrl && (
          <div className="share-screenshot-modal-component">
            <label className="label">{$T.program.imagePreview}</label>
            <div className="has-text-centered">
              <div className="box is-inline-block">
                <img className="screenshot-img" src={this.state.imgUrl} />
              </div>
            </div>
            <br />
            <label className="label">{$T.program.imageUrl}</label>
            <InputCopyToClipboardComponent text={this.state.imgUrl} />
          </div>
        )}
      </ModalComponent>
    );
  }
}
