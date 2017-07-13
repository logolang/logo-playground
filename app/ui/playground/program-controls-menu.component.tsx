import * as React from "react";
import * as cn from "classnames";

import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { _T } from "app/services/customizations/localization.service";

interface IComponentState {}

interface IComponentProps {
  className?: string;
  isRunning: boolean;
  runProgram: () => void;
  stopProgram: () => void;
  existingProgramName?: string;
  saveCurrent?: () => void;
  saveAsNew?: () => void;
  exportImage: () => void;
}

export class ProgramControlsMenuComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render(): JSX.Element {
    return (
      <Navbar className="program-controls-menu-component">
        <Nav>
          {!this.props.isRunning &&
            <NavItem onClick={this.props.runProgram} title={_T("Execute the program (F9)")}>
              <span className="glyphicon glyphicon-play text-success" aria-hidden="true" />
              <span>&nbsp;</span>
              <span>
                {_T("Run")}
              </span>
            </NavItem>}

          {this.props.isRunning &&
            <NavItem onClick={this.props.stopProgram}>
              <span className="glyphicon glyphicon-stop text-danger" aria-hidden="true" />
              <span>&nbsp;</span>
              <span>
                {_T("Stop")}
              </span>
            </NavItem>}

          <NavDropdown
            id="main-playground-menu-options-dropdown"
            bsClass="dropdown"
            noCaret
            pullRight
            title={<span className="glyphicon glyphicon-option-vertical" aria-hidden="true" /> as any}
          >
            {this.props.existingProgramName &&
              this.props.saveCurrent &&
              <MenuItem onClick={this.props.saveCurrent}>
                <span className="glyphicon glyphicon-save" aria-hidden="true" />
                <span>&nbsp;&nbsp;</span>
                <span>
                  {_T("Save program '%s'", { value: this.props.existingProgramName })}
                </span>
              </MenuItem>}
            {this.props.saveAsNew &&
              <MenuItem onClick={this.props.saveAsNew}>
                <span className="glyphicon glyphicon-file" aria-hidden="true" />
                {this.props.existingProgramName
                  ? <span>
                      <span>&nbsp;&nbsp;</span>
                      {_T("Save as new...")}
                    </span>
                  : <span>
                      <span>&nbsp;&nbsp;</span>
                      {_T("Save to Gallery...")}
                    </span>}
              </MenuItem>}
            <MenuItem divider />
            <MenuItem onClick={this.props.exportImage}>
              <span className="glyphicon glyphicon-camera" aria-hidden="true" />
              <span>&nbsp;&nbsp;</span>
              <span>
                {_T("Take Screenshot")}
              </span>
            </MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar>
    );
  }
}
