import * as React from 'react';
import * as cn from 'classnames';
import * as keymaster from 'keymaster';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Subscription } from 'rxjs'

import { stay } from 'app/utils/async-helpers';
import { ensure } from 'app/utils/syntax-helpers';
import { handleError, subscribeLoadDataOnPropsParamsChange, translateInputChangeToState } from 'app/utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { LocalStorageService } from 'app/services/local-storage.service';
import { ProgramsSamplesRepository } from 'app/services/entities/programs-samples.repository';

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PlaygroundPageLayoutComponent } from './playground-page-layout.component';

import './playground-page.component.scss';

interface IComponentState {
    code: string
    programTitle: string
    isLoading: boolean
    errorMessage: string
    isRunning: boolean
    isSaveModalActive: boolean
    isSavingInProgress: boolean
    programNameInSaveModal: string
}

interface IComponentProps {
    params: {
        programId: string | undefined
        gistId: string | undefined
        sampleId: string | undefined
    }
}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    currentCodeLocalStorage = new LocalStorageService<string>('logo-sandbox-codeplayground', 'cs\r\nfd 100');
    playgroundContext = ServiceLocator.resolve(x => x.playgroundContext);
    programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    programSamples = new ProgramsSamplesRepository();
    private isRunningSubscription: Subscription | undefined;

    constructor(props: IComponentProps) {
        super(props);

        let code = this.currentCodeLocalStorage.getValue()

        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    codeChanged = (code: string): void => {
        this.currentCodeLocalStorage.setValue(code);
        this.playgroundContext.setCode(code);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,
            errorMessage: '',
            code: '',
            programTitle: '',
            isRunning: false,
            isSaveModalActive: false,
            isSavingInProgress: false,
            programNameInSaveModal: ''
        };
        return state;
    }

    componentDidMount() {
        this.loadData(this.props);
        this.isRunningSubscription = this.playgroundContext.subscribeToIsRunning(running => {
            this.setState({ isRunning: running });
        });

        keymaster('f8, f9', () => {
            this.playgroundContext.run();
            return false;
        });
    }

    componentWillUnmount() {
        if (this.isRunningSubscription) {
            this.isRunningSubscription.unsubscribe();
        }
        keymaster.unbind('f8, f9');
    }

    async loadData(props: IComponentProps) {
        let code = '';
        let title = 'Program'
        if (props.params.programId) {
            const program = await handleError(this, () => this.programsRepo.get(ensure(props.params.programId)));
            if (program) {
                code = program.code;
                title = program.name;
            }
        } else if (props.params.sampleId) {
            const program = await handleError(this, () => this.programSamples.get(ensure(props.params.sampleId)));
            if (program) {
                code = program.code;
                title = program.name;
            }
        } else if (props.params.gistId) {
        } else {
            code = this.currentCodeLocalStorage.getValue();
            title = 'Playground';
        }

        this.setState({ code: code, programTitle: title });
        this.playgroundContext.setCode(code);
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

        this.setState({ isSavingInProgress: false, programNameInSaveModal: '' });
        this.setState({ isSaveModalActive: false });
    }

    exportAsImage = async () => {
        const data = this.playgroundContext.getScreenshot(false);
        const win = window.open(data, '_blank');
        win.focus();
    }

    render(): JSX.Element {
        document.title = appInfo.description + ": " + this.state.programTitle;
        return (
            <div>
                <MainMenuComponent pullRightChildren={
                    <Nav className="main-playground-menu">
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
                            <MenuItem onClick={() => {
                                this.setState({ isSaveModalActive: true });
                                setTimeout(() => {
                                    (this.refs['programNameSaveInput'] as HTMLInputElement).focus();
                                }, 300);
                            }}>Save to Gallery</MenuItem>
                            <MenuItem divider />
                            <MenuItem onClick={this.exportAsImage}>Export as Image</MenuItem>
                        </NavDropdown>
                    </Nav>
                } />

                {this.renderSaveModal()}

                <PlaygroundPageLayoutComponent code={this.state.code} programName={this.state.programTitle} onCodeChanged={this.codeChanged} >
                </PlaygroundPageLayoutComponent>
            </div >
        );
    }

    renderSaveModal(): JSX.Element | null {
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
                                            <input ref="programNameSaveInput" type="text" className="form-control" id="name" placeholder="Please enter name for your program"
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