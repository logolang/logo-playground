import * as React from 'react';
import * as cn from 'classnames';

import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface IComponentState {
}

interface IComponentProps {
    className?: string
    isRunning: boolean
    runProgram: () => void
    stopProgram: () => void
    existingProgramName?: string
    saveCurrent?: () => void
    saveAsNew?: () => void
    exportImage: () => void
}

export class ProgramControlsMenuComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    componentDidMount() {
    }

    render(): JSX.Element {
        return <Nav className={cn(this.props.className)}>
            <NavItem disabled={this.props.isRunning} onClick={this.props.runProgram}>
                <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
                <span> Run</span>
            </NavItem>
            <NavItem disabled={!this.props.isRunning} onClick={this.props.stopProgram}>
                <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
                <span> Stop</span>
            </NavItem>

            <NavDropdown id="main-playground-menu-options-dropdown" bsClass="dropdown" noCaret pullRight
                title={
                    <span className="glyphicon glyphicon-option-vertical" aria-hidden="true"></span> as any
                }>
                {
                    this.props.existingProgramName && this.props.saveCurrent &&
                    <MenuItem onClick={this.props.saveCurrent}>
                        <span className="glyphicon glyphicon-save" aria-hidden="true"></span>
                        <span>&nbsp;&nbsp;Save program '{this.props.existingProgramName}'</span>
                    </MenuItem>
                }
                {
                    this.props.saveAsNew &&
                    <MenuItem onClick={this.props.saveAsNew}>
                        <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                        {
                            this.props.existingProgramName
                                ? <span>&nbsp;&nbsp;Save as new...</span>
                                : <span>&nbsp;&nbsp;Save to Gallery...</span>
                        }
                    </MenuItem>
                }
                <MenuItem divider />
                <MenuItem onClick={this.props.exportImage}>
                    <span className="glyphicon glyphicon-camera" aria-hidden="true"></span>
                    <span>&nbsp;&nbsp;Take Screenshot</span>
                </MenuItem>
            </NavDropdown>
        </Nav>
    }
}