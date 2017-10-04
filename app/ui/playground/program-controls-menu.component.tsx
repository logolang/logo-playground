import * as React from "react";
import { _T } from "app/services/customizations/localization.service";

interface IComponentState {}

interface IComponentProps {
  className?: string;
  isRunning: boolean;
  runProgram: () => void;
  stopProgram: () => void;
  existingProgramName?: string;
  revertChanges?: () => void;
  saveAsNew?: () => void;
  onShareProgram: () => void;
  exportImage: () => void;
}

export class ProgramControlsMenuComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  render(): JSX.Element | null {
    return (
      <div className="program-controls-menu-component">
        {!this.props.isRunning && (
          <button
            type="button"
            className="button is-success is-borderless"
            onClick={this.props.runProgram}
            title={_T("Execute the program (F9)")}
          >
            {_T("Run")}
          </button>
        )}{" "}
        {this.props.isRunning && (
          <button
            type="button"
            className="button is-warning is-borderless"
            onClick={this.props.stopProgram}
            title={_T("Stop execution of the program")}
          >
            {_T("Stop")}
          </button>
        )}{" "}
        <div className="dropdown is-right is-hoverable is-borderless">
          <div className="dropdown-trigger">
            <button className="button is-light" aria-haspopup="true" aria-controls="dropdown-menu6">
              <i className="fa fa-ellipsis-h" aria-hidden="true" />
            </button>
          </div>
          <div className="dropdown-menu" id="dropdown-menu6" role="menu">
            <div className="dropdown-content">
              {this.props.revertChanges && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.props.revertChanges && this.props.revertChanges();
                  }}
                >
                  <i className="fa fa-undo" aria-hidden="true" />
                  &nbsp;&nbsp;
                  {_T("Revert changes")}
                </a>
              )}
              {this.props.revertChanges && <hr className="dropdown-divider" />}
              {this.props.saveAsNew && (
                <a className="dropdown-item" onClick={this.props.saveAsNew}>
                  <i className="fa fa-file-code-o" aria-hidden="true" />
                  &nbsp;&nbsp;
                  {_T("Save to personal library")}
                </a>
              )}
              <a className="dropdown-item" onClick={this.props.onShareProgram}>
                <i className="fa fa-share-alt" aria-hidden="true" />
                &nbsp;&nbsp;
                {_T("Share")}
              </a>
              <hr className="dropdown-divider" />
              <a className="dropdown-item" onClick={this.props.exportImage}>
                <i className="fa fa-camera" aria-hidden="true" />
                &nbsp;&nbsp;
                {_T("Take screenshot")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
