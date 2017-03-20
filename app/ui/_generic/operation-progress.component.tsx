import * as React from 'react';
import * as cn from 'classnames'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';

import './operation-progress.component.scss'

interface IComponentProps {
}

export class OperationProgressComponent extends React.Component<IComponentProps, void> {

    componentDidMount() {
        console.log('OperationProgressComponent componentDidMount');
        window.onbeforeunload = function (e) {
            return 'Do you want to cancel running operation? WARNING: your data may lost!';
        };
    }

    componentWillUnmount() {
        console.log('OperationProgressComponent componentWillUnmount');
        window.onbeforeunload = function (e) {
            return undefined;
        };
    }

    render(): JSX.Element | null {
        return <Modal show={true} onHide={() => { }} backdrop='static' animation={false}>
            <Modal.Header>
                <Modal.Title>Thanks for waiting</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="operation-progress-box">
                    <br />
                    <br />
                    <div className="operation-progress-icon text-muted">
                        <span className="glyphicon glyphicon-cog cog-1" aria-hidden="true"></span>
                        <span className="glyphicon glyphicon-cog cog-2" aria-hidden="true"></span>
                        <span className="glyphicon glyphicon-cog cog-3" aria-hidden="true"></span>
                    </div>
                    <br />
                    <br />
                    <p className="text-muted">Operation is in progress. Please wait a couple of moments while application is performing data management activities.</p>
                </div>
            </Modal.Body>
        </Modal >
    }
}