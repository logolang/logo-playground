import * as React from "react";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

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
  private eventsTracking = resolveInject(IEventsTrackingService);

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
        errorMessage: _T("Sorry, error has occured")
      });
    }
  }

  render(): JSX.Element | null {
    return (
      <ModalComponent show withoutFooter title={_T("Screenshot")} onCancel={this.props.onClose}>
        <LoadingComponent isLoading={this.state.isSavingInProgress} />
        {this.state.errorMessage && <AlertMessageComponent message={this.state.errorMessage} type="danger" />}
        {this.state.imgUrl && (
          <div className="share-screenshot-modal-component">
            <label className="label">Image preview</label>
            <div className="has-text-centered">
              <div className="box is-inline-block">
                <img className="screenshot-img" src={this.state.imgUrl} />
              </div>
            </div>
            <br />
            <label className="label">Image url</label>
            <InputCopyToClipboardComponent text={this.state.imgUrl} />
          </div>
        )}
      </ModalComponent>
    );
  }
}
