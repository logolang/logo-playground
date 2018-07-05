import * as React from "react";
import * as cn from "classnames";
import { $T } from "app/i18n/strings";

interface IComponentState {
  menuIsActive?: boolean;
}

interface IComponentProps {
  isRunning: boolean;
  onRunProgram: () => void;
  onStopProgram: () => void;
  onRevertChanges?: () => void;
  onSaveProgramAsNew?: () => void;
  onSaveProgram?: () => void;
  onShareProgram: () => void;
  onExportImage: () => void;
  onDeleteProgram?(): void;
}

export class ProgramControlsMenuComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
  }

  programMenuClicked = () => {
    this.setState({ menuIsActive: !this.state.menuIsActive });
  };

  render(): JSX.Element | null {
    return (
      <div className="program-controls-menu-component">
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
              {this.props.onRevertChanges && (
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
              {this.props.onSaveProgram && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.onSaveProgram && this.props.onSaveProgram();
                  }}
                >
                  <i className="fa fa-check-square-o icon-fixed-width" aria-hidden="true" />
                  {$T.program.save}
                </a>
              )}
              {this.props.onSaveProgramAsNew && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.onSaveProgramAsNew && this.props.onSaveProgramAsNew();
                  }}
                >
                  <i className="fa fa-clone icon-fixed-width" aria-hidden="true" />
                  {$T.program.saveAs}
                </a>
              )}
              {this.props.onDeleteProgram && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.onDeleteProgram && this.props.onDeleteProgram();
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
                  this.setState({ menuIsActive: false });
                  this.props.onShareProgram();
                }}
              >
                <i className="fa fa-share-alt icon-fixed-width" aria-hidden="true" />
                {$T.program.share}
              </a>
              <hr className="dropdown-divider" />
              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({ menuIsActive: false });
                  this.props.onExportImage();
                }}
              >
                <i className="fa fa-camera icon-fixed-width" aria-hidden="true" />
                {$T.program.takeScreenshot}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
