import * as React from "react";
import * as cn from "classnames";
import { $T } from "app/i18n-strings";
import { ScreenshotModal } from "app/ui/modals/screenshot-modal";
import { ShareProgramModal } from "app/ui/modals/share-program-modal";
import { SaveProgramModal } from "app/ui/modals/save-program-modal";
import { DeleteProgramModal } from "app/ui/modals/delete-program-modal";

import "./code-menu.less";

interface State {
  menuIsActive?: boolean;
  isTakeScreenshotModalActive?: boolean;
  isShareModalActive?: boolean;
  screenshotImageBase64?: string;
  isSaveAsModalActive?: boolean;
  isDeleteModalActive?: boolean;
}

interface Props {
  isRunning: boolean;
  code: string;
  programName: string;
  programId?: string;
  onRunProgram(): void;
  onStopProgram(): void;
  createScreenShotImageBase64(): string;
  createSmallScreenShotImageBase64(): string;
  isDeleteEnabled?: boolean;
  onDeleteProgram?(): void;
  isRevertEnabled?: boolean;
  onRevertChanges?(): void;
  isSaveEnabled?: boolean;
  onSave?(): void;
  onSaveAs?(newName: string): void;
}

export class CodeMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  programMenuClicked = () => {
    this.setState({ menuIsActive: !this.state.menuIsActive });
  };

  render(): JSX.Element | null {
    return (
      <div className="code-menu-component">
        {!this.props.isRunning && (
          <button
            type="button"
            className="button is-success is-borderless"
            onClick={this.props.onRunProgram}
            title={$T.program.runDescription + " (F9)"}
          >
            {$T.program.run}
          </button>
        )}{" "}
        {this.props.isRunning && (
          <button
            type="button"
            className="button is-warning is-borderless"
            onClick={this.props.onStopProgram}
            title={$T.program.stopDescription}
          >
            {$T.program.stop}
          </button>
        )}{" "}
        <div
          className={cn("dropdown is-right is-borderless", {
            "is-active": this.state.menuIsActive
          })}
        >
          <div className="dropdown-trigger">
            <button
              className="button is-light"
              aria-haspopup="true"
              aria-controls="dropdown-menu6"
              onClick={this.programMenuClicked}
            >
              <i className="fa fa-ellipsis-h" aria-hidden="true" />
            </button>
          </div>
          <div className="dropdown-menu" id="dropdown-menu6" role="menu">
            <div className="dropdown-content">
              {this.props.isSaveEnabled && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.onSave && this.props.onSave();
                  }}
                >
                  <i className="far fa-check-square icon-fixed-width" aria-hidden="true" />
                  {$T.program.save}
                </a>
              )}

              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({
                    menuIsActive: false,
                    isSaveAsModalActive: true,
                    screenshotImageBase64: this.props.createSmallScreenShotImageBase64()
                  });
                }}
              >
                <i className="fa fa-clone icon-fixed-width" aria-hidden="true" />
                {$T.program.saveAs}
              </a>

              {this.props.isRevertEnabled && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.onRevertChanges && this.props.onRevertChanges();
                  }}
                >
                  <i className="fa fa-undo icon-fixed-width" aria-hidden="true" />
                  {$T.program.revertChanges}
                </a>
              )}

              {this.props.isDeleteEnabled && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({
                      menuIsActive: false,
                      isDeleteModalActive: true
                    });
                  }}
                >
                  <i className="fa fa-trash icon-fixed-width" aria-hidden="true" />
                  {$T.common.delete}
                </a>
              )}

              <hr className="dropdown-divider" />

              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({
                    menuIsActive: false,
                    isShareModalActive: true,
                    screenshotImageBase64: this.props.createSmallScreenShotImageBase64()
                  });
                }}
              >
                <i className="fa fa-share-alt icon-fixed-width" aria-hidden="true" />
                {$T.program.share}
              </a>
              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({
                    menuIsActive: false,
                    isTakeScreenshotModalActive: true,
                    screenshotImageBase64: this.props.createScreenShotImageBase64()
                  });
                }}
              >
                <i className="fa fa-camera icon-fixed-width" aria-hidden="true" />
                {$T.program.takeScreenshot}
              </a>
            </div>
          </div>
        </div>
        {this.state.isTakeScreenshotModalActive && (
          <ScreenshotModal
            imageBase64={this.state.screenshotImageBase64 || ""}
            onClose={() => this.setState({ isTakeScreenshotModalActive: false })}
          />
        )}
        {this.state.isShareModalActive && (
          <ShareProgramModal
            programName={this.props.programName}
            programCode={this.props.code}
            imageBase64={this.state.screenshotImageBase64 || ""}
            onClose={() => this.setState({ isShareModalActive: false })}
          />
        )}
        {this.state.isSaveAsModalActive && (
          <SaveProgramModal
            programName={this.props.programName}
            screenshot={this.state.screenshotImageBase64 || ""}
            onClose={() => {
              this.setState({ isSaveAsModalActive: false });
            }}
            onSave={this.handleSaveAs}
            allowRename={true}
          />
        )}
        {this.state.isDeleteModalActive && (
          <DeleteProgramModal
            programName={this.props.programName}
            onClose={() => {
              this.setState({ isDeleteModalActive: false });
            }}
            onDelete={this.handleDelete}
          />
        )}
      </div>
    );
  }

  private handleSaveAs = async (newProgramName: string) => {
    this.props.onSaveAs && this.props.onSaveAs(newProgramName);
  };

  private handleDelete = async () => {
    this.props.onDeleteProgram && this.props.onDeleteProgram();
  };
}
