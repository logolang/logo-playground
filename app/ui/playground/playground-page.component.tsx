import * as React from 'react';
import * as cn from 'classnames';
import * as keymaster from 'keymaster';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Subscription, Subject } from 'rxjs'

import { stay, setupActionErrorHandler, callAction } from 'app/utils/async-helpers';
import { ensure } from 'app/utils/syntax-helpers';
import { subscribeLoadDataOnPropsParamsChange, translateInputChangeToState, goTo } from 'app/utils/react-helpers';

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PlaygroundPageLayoutComponent } from './playground-page-layout.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';
import { SaveProgramModalComponent, IProgramToSaveAttributes } from "app/ui/playground/save-program-modal.component";

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from "app/routes";
import { UserCustomizationsProvider, IUserCustomizationsData } from "app/services/customizations/user-customizations-provider";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/gallery/program.model";

import './playground-page.component.scss';

interface IComponentState {
    isLoading: boolean

    program?: ProgramModel
    isRunning: boolean
    hasProgramBeenExecutedOnce: boolean

    isSaveModalActive: boolean

    userCustomizations?: IUserCustomizationsData
}

interface IComponentProps {
    params: {
        programId: string | undefined
        gistId: string | undefined
        sampleId: string | undefined
    }
}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
    private notificationService = ServiceLocator.resolve(x => x.notificationService);
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    private programSamples = new ProgramsSamplesRepository();
    private userCustomizationsProvider = new UserCustomizationsProvider();
    private userDataService = ServiceLocator.resolve(x => x.userDataService);

    private runCommands = new Subject<string>();
    private stopCommands = new Subject<void>();
    private focusCommands = new Subject<void>();
    private makeScreenshotCommands = new Subject<{ small: boolean, result: (data: string) => void }>();

    private errorHandler = setupActionErrorHandler((error) => {
        this.notificationService.push({ type: 'danger', message: error });
    })

    constructor(props: IComponentProps) {
        super(props);
        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,

            isRunning: false,
            hasProgramBeenExecutedOnce: false,

            isSaveModalActive: false,
        };
        return state;
    }

    componentDidMount() {
        keymaster('f8, f9', () => {
            if (this.state.program) {
                this.runCommands.next(this.state.program.code);
                this.focusCommands.next();
            }
            return false;
        });

        this.loadData(this.props);
    }

    componentWillUnmount() {
        keymaster.unbind('f8, f9');
    }

    codeChanged = (code: string): void => {
        this.setState(s => {
            if (s.program) { s.program.code = code; }
            return s;
        });
        this.userDataService.setPlaygroundCode(code);
    }

    async loadData(props: IComponentProps) {
        this.setState({ isLoading: true });

        const userCustomizations = await callAction(this.errorHandler, () => this.userCustomizationsProvider.getCustomizationsData());
        if (!userCustomizations) { return }

        let program: ProgramModel | undefined;
        if (props.params.programId) {
            program = await callAction(this.errorHandler, () => this.programsRepo.get(ensure(props.params.programId)));
        } else if (props.params.sampleId) {
            program = await callAction(this.errorHandler, () => this.programSamples.get(ensure(props.params.sampleId)));
        } else if (props.params.gistId) {
            //TODO: load program from Gist
        }

        if (!program) {
            const code = await callAction(this.errorHandler, () => this.userDataService.getPlaygroundCode()) || '';
            program = new ProgramModel('', 'Playground', "logo", code, '');
        }
        this.setState({
            isLoading: false,
            program: program,
            userCustomizations: userCustomizations
        });

        document.title = appInfo.description + ": " + program.name;
    }

    onIsRunningChanged = (isRunning: boolean) => {
        this.setState({ isRunning: isRunning });
        if (isRunning) {
            this.setState({ hasProgramBeenExecutedOnce: true });
        }
    }

    runCurrentProgram = () => {
        if (this.state.program) {
            this.runCommands.next(this.state.program.code);
            this.focusCommands.next();
        }
    }

    stopCurrentProgram = () => {
        this.stopCommands.next();
        this.focusCommands.next();
    }

    showSaveDialog = () => {
        this.setState({ isSaveModalActive: true });
    }

    saveCurrentProgram = async () => {
        if (!this.state.program) { return }
        const prog = await this.programsRepo.get(ensure(this.props.params.programId));
        if (this.state.hasProgramBeenExecutedOnce) {
            prog.screenshot = await this.getScreenshot(true);
        }
        prog.code = this.state.program.code;
        await this.programsRepo.update(prog);
        this.focusCommands.next();
    }

    saveProgramAction = async (attrs: IProgramToSaveAttributes): Promise<string | undefined> => {
        if (!this.state.program) { return }

        const programName = attrs.name;

        if (!programName || !programName.trim()) {
            return 'Program name is required.';
        }
        const allProgs = await callAction(this.errorHandler, () => this.programsRepo.getAll());
        if (!allProgs) { return };

        const progWithSameName = allProgs.find(p => p.name.trim().toLowerCase() === programName.trim().toLowerCase());
        if (progWithSameName) {
            return 'Program with this name is already stored in library. Please enter different name.';
        }

        let screenshot = this.state.hasProgramBeenExecutedOnce
            ? await this.getScreenshot(true)
            : '';

        const addedProgram = await callAction(this.errorHandler, () => this.programsRepo.add(
            new ProgramModel('', programName, "logo", this.state.program!.code, screenshot)
        ));

        if (!addedProgram) { return };

        this.setState({
            program: addedProgram,
        });
        this.focusCommands.next();

        goTo(Routes.playgroundLoadFromLibrary.build({ programId: addedProgram.id }));
        return;
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
        return (
            <div>
                <MainMenuComponent pullRightChildren={
                    this.state.program &&
                    <Nav className="main-playground-menu">
                        <NavItem disabled={this.state.isRunning} onClick={this.runCurrentProgram}>
                            <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
                            <span> Run</span>
                        </NavItem>
                        <NavItem disabled={!this.state.isRunning} onClick={this.stopCurrentProgram}>
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
                                    <span>&nbsp;&nbsp;Save program '{this.state.program.name}'</span>
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
                    this.state.program && this.state.userCustomizations &&
                    <PlaygroundPageLayoutComponent
                        program={this.state.program}
                        codePanelProps={{
                            codeInputProps: {
                                code: this.state.program.code,
                                onChanged: this.codeChanged,
                                focusCommands: this.focusCommands,
                                onHotkey: (k) => {
                                    this.runCurrentProgram()
                                },
                                editorTheme: this.state.userCustomizations.codeEditorTheme
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
                                isDarkTheme: this.state.userCustomizations.isDark,
                                customTurtleImage: this.state.userCustomizations.customTurtle,
                                customTurtleSize: this.state.userCustomizations.customTurtleSize
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
            return <SaveProgramModalComponent
                onClose={() => { this.setState({ isSaveModalActive: false }) }}
                onSave={this.saveProgramAction}
            />
        }
        return null;
    }
}