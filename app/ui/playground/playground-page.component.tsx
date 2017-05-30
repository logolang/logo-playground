import * as React from 'react';
import * as cn from 'classnames';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { RouteComponentProps } from "react-router-dom";
import { Subscription, Subject } from 'rxjs'

import { stay, setupActionErrorHandler, callAction } from 'app/utils/async-helpers';
import { ensure } from 'app/utils/syntax-helpers';
import { subscribeLoadDataOnPropsParamsChange, translateInputChangeToState } from 'app/utils/react-helpers';

import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PlaygroundPageLayoutComponent } from './playground-page-layout.component';
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";
import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { UserCustomizationsProvider, IUserCustomizationsData } from "app/services/customizations/user-customizations-provider";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramModel } from "app/services/gallery/program.model";
import { ProgrammingFlowService, IProgramToSaveAttributes } from "app/services/flow/programming-flow.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { ProgramsLocalStorageRepository, IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { IUserDataService } from "app/services/customizations/user-data.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";

import './playground-page.component.scss';

interface IComponentState {
    isLoading: boolean
    program?: ProgramModel
    isRunning: boolean
    isSaveModalActive: boolean
    userCustomizations?: IUserCustomizationsData

    screenshotDataToSave?: string
}

interface IRouteParams {
    programId: string | undefined
    gistId: string | undefined
    sampleId: string | undefined
}

interface IComponentProps extends RouteComponentProps<IRouteParams> {
}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
    @lazyInject(INotificationService)
    private notificationService: INotificationService;

    @lazyInject(TitleService)
    private titleService: TitleService;

    @lazyInject(ProgramsLocalStorageRepository)
    private programsRepo: IProgramsRepository;

    @lazyInject(ProgramsSamplesRepository)
    private programSamples: IProgramsRepository;

    @lazyInject(IUserDataService)
    private userDataService: IUserDataService;

    @lazyInject(UserCustomizationsProvider)
    private userCustomizationsProvider: UserCustomizationsProvider;

    @lazyInject(INavigationService)
    private navService: INavigationService;

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
        this.titleService.setDocumentTitle(_T('Playground'));
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
        if (props.match.params.programId) {
            program = await callAction(this.errorHandler, () => this.programsRepo.get(ensure(props.match.params.programId)));
        } else if (props.match.params.sampleId) {
            program = await callAction(this.errorHandler, () => this.programSamples.get(ensure(props.match.params.sampleId)));
        } else if (props.match.params.gistId) {
            //TODO: load program from Gist
        }

        if (!program) {
            const code = await callAction(this.errorHandler, () => this.userDataService.getPlaygroundCode()) || '';
            program = new ProgramModel('', _T("Playground"), "logo", code, '');
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
        if (!this.state.program || !this.props.match.params.programId) { return }
        const result = await this.errorHandler(() => this.flowService.saveCurrentProgram(ensure(this.props.match.params.programId), this.programsRepo))
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

        this.navService.navigate({ route: Routes.playgroundLoadFromLibrary.build({ programId: addedProgram.id }) });
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
                        exportImage={this.exportScreenshot}
                        saveAsNew={this.showSaveDialog}
                        saveCurrent={this.saveCurrentProgram}
                    />
                } />

                {this.renderSaveModal()}

                {
                    this.state.screenshotDataToSave
                    && <ShareScreenshotModalComponent
                        imageBase64={this.state.screenshotDataToSave}
                        onClose={() => { this.setState({ screenshotDataToSave: '' }) }} />
                }

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
                                customTurtleImage: this.state.userCustomizations.turtleImage,
                                customTurtleSize: this.state.userCustomizations.turtleSize
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

    exportScreenshot = async () => {
        const data = await this.flowService.getScreenshot(false);
        this.setState({ screenshotDataToSave: data });
    }
}