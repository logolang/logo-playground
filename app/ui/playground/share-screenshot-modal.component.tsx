import * as React from "react";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { InputCopyToClipboardComponent } from "app/ui/_generic/input-copy-to-clipboard.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";

import "./share-screenshot-modal.component.scss";

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
  @lazyInject(ImageUploadService) private imageUploadService: ImageUploadService;

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
      //const link = "http://bulma.io/images/placeholders/640x480.png";
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
            <img className="screenshot-img" src={this.state.imgUrl} />
            <br />
            <br />
            <label className="label">Image url</label>
            <InputCopyToClipboardComponent text={this.state.imgUrl} />
          </div>
        )}
      </ModalComponent>
    );
  }
}
