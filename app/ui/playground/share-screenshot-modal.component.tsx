import * as React from "react";
import * as clipboard from "clipboard";

import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ProgressIndicatorComponent } from "app/ui/_generic/progress-indicator.component";
import { ModalComponent } from "app/ui/_generic/modal.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { ImageUploadService } from "app/services/infrastructure/image-upload-imgur.service";

import "./share-screenshot-modal.component.scss";

interface IComponentState {
  errorMessage: string;
  isSavingInProgress: boolean;
  isCopiedToClipboard: boolean;
  imgUrl?: string;
}

interface IComponentProps {
  imageBase64: string;
  onClose: () => void;
}

export class ShareScreenshotModalComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(ImageUploadService) private imageUploadService: ImageUploadService;

  private clipboardInstance: clipboard;

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      isSavingInProgress: true,
      isCopiedToClipboard: false
    };
  }

  async componentDidMount() {
    this.clipboardInstance = new clipboard("#btn-clipboard-img-url");
    this.clipboardInstance.on("success", () => {
      this.setState({ isCopiedToClipboard: true });
    });

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

  componentWillUnmount() {
    if (this.clipboardInstance) {
      this.clipboardInstance.destroy();
    }
  }

  render(): JSX.Element | null {
    return (
      <ModalComponent show withoutFooter title={_T("Screenshot")} onCancel={this.props.onClose}>
        {this.state.isSavingInProgress && <ProgressIndicatorComponent isLoading={this.state.isSavingInProgress} />}
        {this.state.errorMessage && <AlertMessageComponent message={this.state.errorMessage} type="danger" />}
        {this.state.imgUrl && (
          <div className="share-screenshot-modal-component">
            <img className="screenshot-img" src={this.state.imgUrl} />
            <br />
            <br />
            <label className="label">Image url</label>
            <div className="field has-addons">
              <div className="control is-expanded has-icons-right">
                <input id="input-with-img-url" className="input" type="text" value={this.state.imgUrl} readOnly />
                {this.state.isCopiedToClipboard && (
                  <span className="icon is-small is-right">
                    <i className="fa fa-check" />
                  </span>
                )}
              </div>
              <div className="control">
                <button
                  id="btn-clipboard-img-url"
                  type="button"
                  className="button is-info"
                  data-clipboard-target="#input-with-img-url"
                >
                  <i className="fa fa-clipboard" aria-hidden="true" />
                  &nbsp;&nbsp;
                  <span>Copy to clipboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalComponent>
    );
  }
}
