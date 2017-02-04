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
    isStoreModalActive: boolean
    isStoringInProgress: boolean
    programNameInStoreModal: string
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
            isStoreModalActive: false,
            isStoringInProgress: false,
            programNameInStoreModal: ''
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

    storeProgramAction = async () => {
        this.setState({ isStoringInProgress: true });
        let screenshot = this.playgroundContext.getScreenshot();

        await this.programsRepo.add({
            code: this.playgroundContext.getCode(),
            name: this.state.programNameInStoreModal,
            lang: 'logo',
            dateCreated: '',
            dateLastEdited: '',
            id: '',
            screenshot: screenshot
        });

        await stay(100);

        this.setState({ isStoringInProgress: false, programNameInStoreModal: '' });
        this.setState({ isStoreModalActive: false });
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
                <MenuItem onClick={() => { this.setState({ isStoreModalActive: true }) }}>Store to library</MenuItem>
            </NavDropdown>
            {this.renderStoreModal()}
        </Nav>
    }

    renderStoreModal(): JSX.Element | null {
        if (this.state.isStoreModalActive) {
            return <Modal show={true} animation={false} onHide={() => { this.setState({ isStoreModalActive: false }) }} backdrop='static' >
                <Modal.Header closeButton>
                    <Modal.Title>Store your program to library</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <br />
                    <form className="form-horizontal">
                        <fieldset>
                            <div className="form-group ex-margin-bottom-zero">
                                <label htmlFor="name" className="col-lg-2 control-label">Program name</label>
                                <div className="col-sm-12">
                                    <input className="form-control" id="name" placeholder="Please enter name for your program" type="text"
                                        value={this.state.programNameInStoreModal}
                                        onChange={translateInputChangeToState(this, (s, v) => ({ programNameInStoreModal: v }))}
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </form>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={cn("btn btn-primary", { "is-loading": this.state.isStoringInProgress })} onClick={this.storeProgramAction}>
                        <span>Save</span>
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => { this.setState({ isStoreModalActive: false }) }}>
                        <span>Cancel</span>
                    </button>
                </Modal.Footer>
            </Modal>
        }
        return null;
    }
}