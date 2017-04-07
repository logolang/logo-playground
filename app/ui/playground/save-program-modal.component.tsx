import * as React from 'react';
import * as cn from 'classnames'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { translateInputChangeToState } from "app/utils/react-helpers";

interface IComponentState {
    errorMessage: string
    programName: string
    isSavingInProgress: boolean
}

interface IComponentProps {
    onClose: () => void
    onSave: (attributes: IProgramToSaveAttributes) => Promise<string | undefined>
}

export interface IProgramToSaveAttributes {
    name: string
}

export class SaveProgramModalComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            errorMessage: '',
            programName: '',
            isSavingInProgress: false,
        }
    }

    render(): JSX.Element {
        return (
            <Modal show={true} animation={false} onHide={this.props.onClose} backdrop='static' >
                <Modal.Header closeButton>
                    <Modal.Title>Save your program to Gallery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-12">
                            <AlertMessageComponent message={this.state.errorMessage} />
                            <form>
                                <div className="form-group">
                                    <label htmlFor="program-name-in-save-dialog">Program name</label>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" id="program-name-in-save-dialog" placeholder="Please enter name for your program"
                                                autoFocus
                                                value={this.state.programName}
                                                onChange={translateInputChangeToState(this, (s, v) => ({ programName: v }))}
                                                onKeyDown={event => {
                                                    if (event.which == 13) {
                                                        event.preventDefault();
                                                        this.saveProgramAction();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={cn("btn btn-primary", { "is-loading": this.state.isSavingInProgress })} onClick={this.saveProgramAction}>
                        <span>Save</span>
                    </button>
                    <button type="button" className="btn btn-link" onClick={this.props.onClose}>
                        <span>Cancel</span>
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }

    saveProgramAction = async () => {
        this.setState({ isSavingInProgress: true });
        const attrs: IProgramToSaveAttributes = {
            name: this.state.programName
        };

        let message = await this.props.onSave(attrs);
        if (message) {
            this.setState({
                isSavingInProgress: false,
                errorMessage: message
            });
        } else {
            this.props.onClose();
        }
    }
}