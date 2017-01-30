import * as React from 'react';
import * as cn from 'classnames'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';

interface IComponentState {
    isDeletionConfirmed: boolean
    errorMessage: string
    actionButtonText: JSX.Element | string
}

interface IComponentProps {
    headerText?: string
    onCancel: () => void;
    onConfirm: () => Promise<string>;
    actionButtonText?: JSX.Element | string
}

export class ActionConfirmationModalComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            errorMessage: '',
            isDeletionConfirmed: false,
            actionButtonText: this.props.actionButtonText || "Delete"
        }
    }

    render(): JSX.Element {
        const headerText = this.props.headerText || "Are you sure?";
        return (
            <Modal show={true} onHide={this.props.onCancel} backdrop='static'>
                <Modal.Header closeButton>
                    <Modal.Title>{headerText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.children}
                    {
                        this.state.errorMessage && <div>
                            <br />
                            <div className="alert alert-danger" role="alert">{this.state.errorMessage}</div>
                        </div>
                    }
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={cn("btn btn-primary", { "is-loading": this.state.isDeletionConfirmed })} onClick={
                        async () => {
                            this.setState({ isDeletionConfirmed: true });
                            let result = await this.props.onConfirm();
                            if (result) {
                                this.setState({ isDeletionConfirmed: false, errorMessage: result });
                            }
                        }
                    }>{this.state.actionButtonText}</button>
                    <button type="button" className="btn btn-link" onClick={
                        () => {
                            if (!this.state.isDeletionConfirmed) {
                                this.props.onCancel();
                            }
                        }
                    }><span>Cancel</span></button>
                </Modal.Footer>
            </Modal >
        );
    }
}