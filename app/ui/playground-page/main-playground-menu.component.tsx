import * as React from 'react';
import * as cn from 'classnames';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Subscription } from 'rxjs'

import { translateInputChangeToState } from 'app/utils/react-helpers';
import { stay } from 'app/utils/async-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from 'app/routes';

import './main-playground-menu.component.scss';

interface IComponentState {
    isRunning: boolean
    isSaveModalActive: boolean
    isSavingInProgress: boolean
    programNameInSaveModal: string
}

interface IComponentProps {
}

export class MainPlaygroundMenuComponent extends React.Component<IComponentProps, IComponentState> {
    private subscription: Subscription
    private playgroundContext = ServiceLocator.resolve(x => x.playgroundContext);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isRunning: false,
            isSaveModalActive: false,
            isSavingInProgress: false,
            programNameInSaveModal: ''
        }
    }

    componentDidMount() {
        this.subscription = this.playgroundContext.subscribeToIsRunning(running => {
            this.setState({ isRunning: running });
        })
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    runClick = () => {
        this.playgroundContext.run();
    }

    stopClick = () => {
        this.playgroundContext.stop();
    }

    saveProgramAction = async () => {
        this.setState({ isSavingInProgress: true });
        let screenshot = this.playgroundContext.getScreenshot(true);

        await this.programsRepo.add({
            code: this.playgroundContext.getCode(),
            name: this.state.programNameInSaveModal,
            lang: 'logo',
            dateCreated: '',
            dateLastEdited: '',
            id: '',
            screenshot: screenshot
        });

        await stay(100);

        this.setState({ isSavingInProgress: false, programNameInSaveModal: '' });
        this.setState({ isSaveModalActive: false });
    }

    exportAsImage = async () => {
        const data = this.playgroundContext.getScreenshot(false);
        const win = window.open(data, '_blank');
        win.focus();
    }

    render(): JSX.Element | null {
        return <Nav className="main-playground-menu">
            <NavItem disabled={this.state.isRunning} onClick={this.runClick}>
                <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
                <span> Run</span>
            </NavItem>
            <NavItem disabled={!this.state.isRunning} onClick={this.stopClick}>
                <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
                <span> Stop</span>
            </NavItem>

            <NavDropdown id="main-playground-menu-options-dropdown" bsClass="dropdown" noCaret
                title={
                    <span className="glyphicon glyphicon-option-vertical" aria-hidden="true"></span> as any
                }>
                <MenuItem onClick={() => { this.setState({ isSaveModalActive: true }) }}>Save to Gallery</MenuItem>
                <MenuItem divider />
                <MenuItem onClick={this.exportAsImage}>Export as Image</MenuItem>
            </NavDropdown>
            {this.renderStoreModal()}
        </Nav>
    }

    renderStoreModal(): JSX.Element | null {
        if (this.state.isSaveModalActive) {
            return <Modal show={true} animation={false} onHide={() => { this.setState({ isSaveModalActive: false }) }} backdrop='static' >
                <Modal.Header closeButton>
                    <Modal.Title>Save your program to Gallery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-12">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="name">Program name</label>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <input type="text" className="form-control" id="name" placeholder="Please enter name for your program"
                                                value={this.state.programNameInSaveModal}
                                                onChange={translateInputChangeToState(this, (s, v) => ({ programNameInSaveModal: v }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <br />
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={cn("btn btn-primary", { "is-loading": this.state.isSavingInProgress })} onClick={this.saveProgramAction}>
                        <span>Save</span>
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => { this.setState({ isSaveModalActive: false }) }}>
                        <span>Cancel</span>
                    </button>
                </Modal.Footer>
            </Modal>
        }
        return null;
    }
}