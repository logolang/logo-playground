import * as React from 'react';
import * as cn from 'classnames';
import * as keymaster from 'keymaster';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Subscription, Subject } from 'rxjs'

import { stay } from 'app/utils/async-helpers';
import { ensure } from 'app/utils/syntax-helpers';
import { handleError, subscribeLoadDataOnPropsParamsChange, translateInputChangeToState } from 'app/utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { LocalStorageService } from "app/services/infrastructure/local-storage.service";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PlaygroundPageLayoutComponent } from './playground-page-layout.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';

import './playground-page.component.scss';

interface IComponentState {
    isLoading: boolean
    errorMessage: string

    programTitle: string

    isRunning: boolean
    hasProgramBeenExecutedOnce: boolean

    isSaveModalActive: boolean
    isSavingInProgress: boolean
    programNameInSaveModal: string
    errorInSaveModal: string
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
    currentCodeLocalStorage = new LocalStorageService<string>('logo-sandbox-codeplayground', 'fd 100\r\nlt 90\r\nfd 80');
    programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    programSamples = new ProgramsSamplesRepository();

    private code: string;
    private runCommands = new Subject<string>();
    private stopCommands = new Subject<void>();
    private focusCommands = new Subject<void>();
    private makeScreenshotCommands = new Subject<{ small: boolean, result: (data: string) => void }>();

    constructor(props: IComponentProps) {
        super(props);

        let code = this.currentCodeLocalStorage.getValue()

        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,
            errorMessage: '',

            programTitle: '',

            isRunning: false,
            hasProgramBeenExecutedOnce: false,

            isSaveModalActive: false,
            isSavingInProgress: false,
            programNameInSaveModal: '',
            errorInSaveModal: ''
        };
        return state;
    }

    componentDidMount() {
        this.loadData(this.props);
    }

    componentWillUnmount() {
        keymaster.unbind('f8, f9');
    }

    codeChanged = (code: string): void => {
        this.currentCodeLocalStorage.setValue(code);
        this.code = code;
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

        this.code = code;
        this.setState({ isLoading: false, programTitle: title });

        keymaster.unbind('f8, f9');
        keymaster('f8, f9', () => {
            this.runCommands.next(this.code);
            this.focusCommands.next();
            return false;
        });
    }

    onIsRunningChanged = (isRunning: boolean) => {
        this.setState({ isRunning: isRunning });
        if (isRunning) {
            this.setState({ hasProgramBeenExecutedOnce: true });
        }
    }

    runClick = () => {
        this.runCommands.next(this.code);
        this.focusCommands.next();
    }

    stopClick = () => {
        this.stopCommands.next();
        this.focusCommands.next();
    }

    showSaveDialog = () => {
        this.setState({ isSaveModalActive: true, errorInSaveModal: '' });
        setTimeout(() => {
            (this.refs['programNameSaveInput'] as HTMLInputElement).focus();
        }, 300);
    }

    saveCurrentProgram = async () => {
        const prog = await this.programsRepo.get(ensure(this.props.params.programId));
        if (this.state.hasProgramBeenExecutedOnce) {
            prog.screenshot = await this.getScreenshot(true);
        }
        prog.code = this.code;
        await this.programsRepo.update(prog);
        this.focusCommands.next();
    }

    saveProgramAction = async () => {
        if (this.state.isSavingInProgress) {
            return;
        }

        if (!this.state.programNameInSaveModal || !this.state.programNameInSaveModal.trim()) {
            this.setState({ errorInSaveModal: 'Program name is required.' })
            return;
        }
        const allProgs = await this.programsRepo.getAll();
        const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === this.state.programNameInSaveModal.trim().toLowerCase());
        if (progWithSameName) {
            this.setState({ errorInSaveModal: 'Program with this name is already stored in library. Please enter different name.' })
            return;
        }

        this.setState({ isSavingInProgress: true });
        let screenshot = this.state.hasProgramBeenExecutedOnce
            ? await this.getScreenshot(true)
            : '';

        await this.programsRepo.add({
            name: this.state.programNameInSaveModal,
            id: '',
            dateCreated: new Date(0),
            dateLastEdited: new Date(0),
            lang: 'logo',
            code: this.code,
            screenshot: screenshot
        });

        this.setState({ isSavingInProgress: false, programNameInSaveModal: '' });
        this.setState({ isSaveModalActive: false });
        this.focusCommands.next();
    }

    exportAsImageClick = async () => {
        const data = await this.getScreenshot(false);
        const win = window.open(data, '_blank');
        win.focus();
        this.focusCommands.next();
    }

    private getScreenshot(small: boolean): Promise<string> {
        return new Promise<string>(resolve => {
            this.makeScreenshotCommands.next({
                small: small, result: (data: string) => {
                    resolve(data);
                }
            });
        });
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

                        <NavDropdown id="main-playground-menu-options-dropdown" bsClass="dropdown" noCaret pullRight
                            title={
                                <span className="glyphicon glyphicon-option-vertical" aria-hidden="true"></span> as any
                            }>
                            {
                                this.props.params.programId &&
                                <MenuItem onClick={this.saveCurrentProgram}>
                                    <span className="glyphicon glyphicon-save" aria-hidden="true"></span>
                                    <span>&nbsp;&nbsp;Save program '{this.state.programTitle}'</span>
                                </MenuItem>
                            }
                            <MenuItem onClick={this.showSaveDialog}>
                                <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                                {
                                    this.props.params.programId
                                        ? <span>&nbsp;&nbsp;Save as new...</span>
                                        : <span>&nbsp;&nbsp;Save to Gallery...</span>
                                }
                            </MenuItem>
                            <MenuItem divider />
                            <MenuItem onClick={this.exportAsImageClick}>
                                <span className="glyphicon glyphicon-camera" aria-hidden="true"></span>
                                <span>&nbsp;&nbsp;Take Screenshot</span>
                            </MenuItem>
                        </NavDropdown>
                    </Nav>
                } />

                {this.renderSaveModal()}

                {
                    !this.state.isLoading &&
                    <PlaygroundPageLayoutComponent
                        programName={this.state.programTitle}
                        codePanelProps={{
                            codeInputProps: {
                                code: this.code,
                                onChanged: this.codeChanged,
                                focusCommands: this.focusCommands,
                                onHotkey: (k) => {
                                    console.log('received hotkey', k);
                                    this.runCommands.next(this.code);
                                }
                            }
                        }}
                        outputPanelProps={{
                            logoExecutorProps: {
                                height: 300,
                                runCommands: this.runCommands,
                                stopCommands: this.stopCommands,
                                makeScreenshotCommands: this.makeScreenshotCommands,
                                onIsRunningChanged: this.onIsRunningChanged,
                                onError: () => { },
                            }
                        }}
                    >
                    </PlaygroundPageLayoutComponent>
                }
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
                    <AlertMessageComponent message={this.state.errorInSaveModal} />
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