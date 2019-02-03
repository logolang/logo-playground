import * as React from "react";
import * as cn from "classnames";

import { $T } from "app/i18n-strings";

import { Modal } from "app/ui/_generic/modal";
import { Loading } from "../_generic/loading";
import { AlertMessage } from "../_generic/alert-message";

interface State {
  fileName?: string;
  fileContent?: string;
}

interface Props {
  showImportModal: boolean;
  importErrorMessage: string;
  isImportInProgress: boolean;
  onImport(htmlContent: string): void;
  onClose(): void;
}

export class ImportProgramsModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  handleFileInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target) {
      const input = e.target as HTMLInputElement;
      if (input && input.files) {
        const file = input.files.item(0);
        if (file) {
          const reader = new FileReader();
          reader.onload = async evt => {
            const fileBody = (evt.target as any).result as string | undefined;
            if (fileBody) {
              this.setState({
                fileName: file.name,
                fileContent: fileBody
              });
            }
          };
          reader.readAsText(file, "UTF-8");
        }
      }
    }
  };

  handleImportClick = async () => {
    this.state.fileContent && this.props.onImport(this.state.fileContent);
  };

  handleCancel = () => {
    this.setState({ fileName: "" });
    this.props.onClose();
  };

  render(): JSX.Element | null {
    return (
      <Modal
        show={this.props.showImportModal}
        title={"Import programs to your library"}
        cancelButtonText={$T.common.cancel}
        onCancel={this.handleCancel}
        actionButtonText={"Import"}
        onConfirm={
          this.state.fileName && !this.props.isImportInProgress ? this.handleImportClick : undefined
        }
      >
        {this.props.isImportInProgress ? (
          <Loading isLoading />
        ) : (
          <>
            <div className={cn("file is-boxed", { "has-name": !!this.state.fileName })}>
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="resume"
                  onChange={this.handleFileInputChange}
                />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload" />
                  </span>
                  <span className="file-label">Choose a file…</span>
                </span>
                {this.state.fileName && <span className="file-name">{this.state.fileName}</span>}
              </label>
            </div>
            {this.props.importErrorMessage && (
              <>
                <br />
                <AlertMessage type="danger" message={this.props.importErrorMessage} />
              </>
            )}
          </>
        )}
      </Modal>
    );
  }
}
