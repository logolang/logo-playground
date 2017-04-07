import * as React from 'react';
import * as cn from 'classnames';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Subscription, Subject } from 'rxjs'

import { stay, setupActionErrorHandler, callAction } from 'app/utils/async-helpers';
import { ensure } from 'app/utils/syntax-helpers';
import { subscribeLoadDataOnPropsParamsChange, translateInputChangeToState, goTo } from 'app/utils/react-helpers';

import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PlaygroundPageLayoutComponent } from './playground-page-layout.component';
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from "app/routes";
import { UserCustomizationsProvider, IUserCustomizationsData } from "app/services/customizations/user-customizations-provider";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/gallery/program.model";
import { ProgrammingFlowService, IProgramToSaveAttributes } from "app/services/flow/programming-flow.service";

import './playground-page.component.scss';

interface IComponentState {
    isLoading: boolean
    program?: ProgramModel
    isRunning: boolean
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
    private titleService = ServiceLocator.resolve(x => x.titleService);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    private programSamples = new ProgramsSamplesRepository();
    private userCustomizationsProvider = new UserCustomizationsProvider();
    private userDataService = ServiceLocator.resolve(x => x.userDataService);
    private flowService = new ProgrammingFlowService();

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
            isSaveModalActive: false,
        };
        return state;
    }

    componentDidMount() {
        this.titleService.setDocumentTitle('Playground');
        this.loadData(this.props);
        this.flowService.initHotkeys();
    }

    componentWillUnmount() {
        this.flowService.disposeHotkeys();
    }

    codeChanged = (code: string): void => {
        this.flowService.code = code;
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

        this.flowService.code = program.code;
        this.setState({
            isLoading: false,
            program: program,
            userCustomizations: userCustomizations
        });

        this.titleService.setDocumentTitle(program.name);
    }

    onIsRunningChanged = (isRunning: boolean) => {
        this.setState({ isRunning: isRunning });
    }

    showSaveDialog = () => {
        this.setState({ isSaveModalActive: true });
    }

    saveCurrentProgram = async () => {
        if (!this.state.program || !this.props.params.programId) { return }
        const result = await this.errorHandler(() => this.flowService.saveCurrentProgram(ensure(this.props.params.programId), this.programsRepo))
    }

    saveProgramAction = async (attrs: IProgramToSaveAttributes): Promise<string | undefined> => {
        if (!this.state.program) { return }
        let errorMessage = '';
        const errorHandler = setupActionErrorHandler(err => { errorMessage = err });
        const addedProgram = await errorHandler(() => this.flowService.saveCurrentProgramToRepository(attrs, this.programsRepo));
        if (!addedProgram) { return errorMessage }

        this.setState({
            program: addedProgram,
        });

        goTo(Routes.playgroundLoadFromLibrary.build({ programId: addedProgram.id }));
        return;
    }

    render(): JSX.Element {
        return (
            <div>
                <MainMenuComponent pullRightChildren={
                    this.state.program &&
                    <ProgramControlsMenuComponent
                        className="main-playground-menu"
                        isRunning={this.state.isRunning}
                        existingProgramName={this.state.program.id && this.state.program.name}
                        runProgram={this.flowService.runCurrentProgram}
                        stopProgram={this.flowService.stopCurrentProgram}
                        exportImage={this.flowService.exportCurrentImage}
                        saveAsNew={this.showSaveDialog}
                        saveCurrent={this.saveCurrentProgram}
                    />
                } />

                {this.renderSaveModal()}

                {
                    this.state.program && this.state.userCustomizations &&
                    <PlaygroundPageLayoutComponent
                        program={this.state.program}
                        codePanelProps={{
                            codeInputProps: {
                                code: this.flowService.code,
                                onChanged: this.codeChanged,
                                focusCommands: this.flowService.focusCommands,
                                onHotkey: this.flowService.runCurrentProgram,
                                editorTheme: this.state.userCustomizations.codeEditorTheme
                            }
                        }}
                        outputPanelProps={{
                            logoExecutorProps: {
                                height: 300,
                                runCommands: this.flowService.runCommands,
                                stopCommands: this.flowService.stopCommands,
                                makeScreenshotCommands: this.flowService.makeScreenshotCommands,
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