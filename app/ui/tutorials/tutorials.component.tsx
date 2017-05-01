import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs'

import { subscribeLoadDataOnPropsParamsChange } from 'app/utils/react-helpers';
import { setupActionErrorHandler, callAction } from 'app/utils/async-helpers';

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';
import { OpacityGradientComponent } from 'app/ui/_generic/opacity-gradient.component';
import { PageLoadingIndicatorComponent } from 'app/ui/_generic/page-loading-indicator.component';
import { CodeInputLogoComponent } from 'app/ui/_shared/code-input-logo.component';
import { LogoExecutorComponent } from 'app/ui/_shared/logo-executor.component';
import { TutorialSelectModalComponent } from './tutorial-select-modal.component';

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from 'app/routes';
import { UserCustomizationsProvider, IUserCustomizationsData } from "app/services/customizations/user-customizations-provider";
import { ITutorialInfo, ITutorialStep } from "app/services/tutorials/tutorials-content-service";
import { ProgrammingFlowService } from "app/services/flow/programming-flow.service";
import { _T } from "app/services/customizations/localization.service";

import './tutorials.component.scss';

interface IComponentState {
    isLoading: boolean
    tutorials: ITutorialInfo[]
    currentTutorial: ITutorialInfo | undefined
    steps: ITutorialStep[]
    currentStep: ITutorialStep | undefined

    showSelectionTutorials: boolean
    showFixTheCode: boolean
    isRunning: boolean

    userCustomizations?: IUserCustomizationsData
}

interface IComponentProps extends RouteComponentProps<ITutorialPageRouteParams> {
}

export interface ITutorialPageRouteParams {
    tutorialId: string,
    stepIndex: string
}

export class TutorialsComponent extends React.Component<IComponentProps, IComponentState> {
    private notificationService = ServiceLocator.resolve(x => x.notificationService);
    private titleService = ServiceLocator.resolve(x => x.titleService);
    private tutorialsLoader = ServiceLocator.resolve(x => x.tutorialsService);
    private userDataService = ServiceLocator.resolve(x => x.userDataService);
    private navService = ServiceLocator.resolve(x => x.navigationService);
    private userCustomizationsProvider = new UserCustomizationsProvider();
    private flowService = new ProgrammingFlowService();

    constructor(props: IComponentProps) {
        super(props);
        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,
            tutorials: [],
            currentTutorial: undefined,

            steps: [],
            currentStep: undefined,

            showSelectionTutorials: false,
            showFixTheCode: false,
            isRunning: false,
        };
        return state;
    }

    componentDidMount() {
        this.loadData(this.props);
        this.flowService.initHotkeys();
        this.titleService.setDocumentTitle(_T("Tutorials"));
    }

    componentWillUnmount() {
        this.flowService.disposeHotkeys();
    }

    async loadData(props: IComponentProps) {
        const errorHandler = setupActionErrorHandler((error) => {
            this.notificationService.push({ type: 'danger', message: error });
            this.setState({ isLoading: false });
        })

        const userCustomizations = await callAction(errorHandler, () => this.userCustomizationsProvider.getCustomizationsData());
        if (!userCustomizations) { return }

        const lastTutorialInfo = await callAction(errorHandler, () => this.userDataService.getCurrentTutorialInfo());
        if (!lastTutorialInfo) { return }
        let initialCode = lastTutorialInfo.code;

        let tutorialIdToLoad = props.match.params.tutorialId;
        let stepIndex = this.parseStepIndexFromParam(props.match.params.stepIndex);
        if (!tutorialIdToLoad) {
            if (lastTutorialInfo.tutorialName) {
                this.navService.navigate({
                    route: Routes.tutorialSpecified.build({
                        tutorialId: lastTutorialInfo.tutorialName,
                        stepIndex: this.formatStepIndexToParam(lastTutorialInfo.step)
                    })
                });
                return;
            }
        }
        if (!this.state.currentTutorial) {
            // Run code automatically if page is just opened
            setTimeout(() => {
                this.flowService.runCurrentProgram();
            }, 100);
        }

        if (!this.state.currentTutorial || this.state.currentTutorial.id !== tutorialIdToLoad) {
            this.setState({ isLoading: true });
            const tutorialInfos = await callAction(errorHandler, () => this.tutorialsLoader.getTutorialsList());
            if (!tutorialInfos) { return }
            let currentTutorial = tutorialIdToLoad
                ? tutorialInfos.find(t => t.id === tutorialIdToLoad)
                : tutorialInfos[0];
            if (!currentTutorial) {
                await callAction(errorHandler, () => { throw new Error(`Can't find tutorial with id ${tutorialIdToLoad}`) });
                currentTutorial = tutorialInfos[0];
                stepIndex = 0;
            }
            const steps = await callAction(errorHandler, () => this.tutorialsLoader.getSteps(currentTutorial!.id));
            if (!steps) { return }
            this.setState({
                tutorials: tutorialInfos,
                currentTutorial: currentTutorial,
                steps: steps,
                userCustomizations: userCustomizations,
            });
            this.flowService.code = initialCode;
        }
        this.setState(s => ({
            isLoading: false,
            currentStep: s.steps[stepIndex]
        }));
    }

    private parseStepIndexFromParam(stepIndexFromParam: string) {
        let stepIndex = parseInt(stepIndexFromParam, 10);
        if (isNaN(stepIndex)) { return 0; }
        return stepIndex - 1;
    }
    private formatStepIndexToParam(stepIndex: number): string {
        return (stepIndex + 1).toString();
    }

    navigateToNextStep = (direction: number) => {
        return () => {
            if (this.state.currentStep && this.state.currentTutorial) {
                let newStepIndex = this.state.currentStep.index + direction;
                this.navService.navigate({
                    route: Routes.tutorialSpecified.build({
                        tutorialId: this.state.currentTutorial.id,
                        stepIndex: this.formatStepIndexToParam(newStepIndex)
                    })
                });
            }
        }
    }

    render(): JSX.Element {
        let nextStepButtonDisabled = true;
        let prevStepButtonDisabled = true;
        if (this.state.currentStep) {
            nextStepButtonDisabled = this.state.currentStep.index >= this.state.steps.length - 1;
            prevStepButtonDisabled = this.state.currentStep.index <= 0;
        }

        return (
            <div className="ex-page-container">
                <MainMenuComponent />
                {
                    this.renderFixTheCodeModal()
                }
                {
                    this.state.showSelectionTutorials &&
                    <TutorialSelectModalComponent
                        tutorials={this.state.tutorials}
                        onCancel={() => { this.setState({ showSelectionTutorials: false }) }}
                        onSelect={(tutorialId) => {
                            this.setState({ showSelectionTutorials: false });
                            this.navService.navigate({
                                route: Routes.tutorialSpecified.build({
                                    tutorialId: tutorialId,
                                    stepIndex: this.formatStepIndexToParam(0)
                                })
                            });
                        }}
                    />
                }
                <div className="ex-display-flex ex-flex-direction-row ex-flex-block ">
                    <div className="ex-display-flex ex-flex-direction-column ex-flex-block">
                        <div className="ex-display-flex ex-flex-block ex-overflow-hidden">
                            {
                                this.state.isLoading &&
                                <PageLoadingIndicatorComponent isLoading={true} className="ex-display-flex ex-flex-block ex-overflow-hidden" />
                            }
                            {
                                (!this.state.isLoading && this.state.currentStep && this.state.currentTutorial) &&
                                <div className="current-step-panel-container">
                                    <div className="current-step-panel panel-default">
                                        <div className="current-step-panel-heading">
                                            <div className="tutorials-selector-container">
                                                <button className="btn btn-info" onClick={() => { this.setState({ showSelectionTutorials: true }) }}>
                                                    <span>{this.state.currentTutorial.label}&nbsp;&nbsp;</span>
                                                    <span className="caret"></span>
                                                </button>
                                            </div>
                                            <div className="prev-btn-container">
                                                <button type="button" className="btn btn-default step-nav-btn" disabled={prevStepButtonDisabled}
                                                    onClick={this.navigateToNextStep(-1)}>
                                                    <span className="glyphicon glyphicon-triangle-left" aria-hidden="true"></span>
                                                </button>
                                            </div>
                                            <div className="step-title-container">
                                                <span>{_T("Step %1$s of %2$s", { values: [this.state.currentStep.index + 1, this.state.currentTutorial.steps] })}</span>
                                            </div>
                                            <div className="next-btn-container">
                                                <button type="button" className="btn btn-default step-nav-btn" disabled={nextStepButtonDisabled}
                                                    onClick={this.navigateToNextStep(1)}>
                                                    <span className="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="current-step-panel-body">
                                            {
                                                <div className="current-step-panel-inner">
                                                    <div className="step-content"
                                                        dangerouslySetInnerHTML={{ __html: this.state.currentStep.content }}>
                                                    </div>
                                                    <div className="pull-right">
                                                        {
                                                            this.state.currentStep.resultCode &&
                                                            <button type="button" className="btn btn-warning"
                                                                onClick={() => {
                                                                    this.setState({ showFixTheCode: true })
                                                                }}>
                                                                <span>{_T("Help – it's not working!")}</span>
                                                            </button>
                                                        }
                                                        <span> </span>
                                                        {
                                                            (!nextStepButtonDisabled) &&
                                                            <button type="button" className="btn btn-primary"
                                                                onClick={this.navigateToNextStep(1)}>
                                                                <span>{_T("Continue")}&nbsp;&nbsp;</span>
                                                                <span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>
                                                            </button>
                                                        }
                                                        {
                                                            nextStepButtonDisabled &&
                                                            <button type="button" className="btn btn-primary"
                                                                onClick={() => { this.setState({ showSelectionTutorials: true }) }}>
                                                                <span>{_T("Choose another tutorial")}&nbsp;&nbsp;</span>
                                                                <span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>
                                                            </button>
                                                        }
                                                        <br />
                                                        <br />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <OpacityGradientComponent className="bottom-opacity-gradient" />
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="ex-display-flex ex-flex-block">
                            <div className="panel-body logo-output-panel">
                                {
                                    this.state.userCustomizations &&
                                    <LogoExecutorComponent
                                        height={200}
                                        onError={() => { }}
                                        onIsRunningChanged={(running) => { this.setState({ isRunning: running }) }}
                                        runCommands={this.flowService.runCommands}
                                        stopCommands={this.flowService.stopCommands}
                                        makeScreenshotCommands={this.flowService.makeScreenshotCommands}
                                        customTurtleImage={this.state.userCustomizations.turtleImage}
                                        customTurtleSize={this.state.userCustomizations.turtleSize}
                                        isDarkTheme={this.state.userCustomizations.isDark}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                    <div className="ex-display-flex ex-flex-block">
                        <div className="source-input-panel panel panel-default">
                            <div className="source-input-panel-heading panel-heading">
                                {
                                    !this.state.isRunning &&
                                    <button type="button" className="btn btn-success"
                                        onClick={this.flowService.runCurrentProgram}
                                    >
                                        <span>{_T("Run")}</span>
                                        <span className="glyphicon glyphicon-play" aria-hidden="true"> <small>(F9)</small></span>
                                    </button>
                                }
                                {
                                    this.state.isRunning &&
                                    <button type="button" className="btn btn-default"
                                        onClick={this.flowService.stopCurrentProgram}
                                    >
                                        <span>{_T("Stop")}</span>
                                        <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
                                    </button>
                                }
                            </div>
                            <div className="source-input-panel-body panel-body">
                                {
                                    this.state.userCustomizations && this.state.currentTutorial && this.state.currentStep &&
                                    <CodeInputLogoComponent
                                        className="codemirror-input-logo"
                                        code={this.flowService.code}
                                        onChanged={(code) => {
                                            this.flowService.code = code;
                                            this.userDataService.setCurrentTutorialInfo({
                                                tutorialName: this.state.currentTutorial!.id,
                                                step: this.state.currentStep!.index,
                                                code: code,
                                            });
                                        }}
                                        focusCommands={this.flowService.focusCommands}
                                        onHotkey={this.flowService.runCurrentProgram}
                                        editorTheme={this.state.userCustomizations.codeEditorTheme}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderFixTheCodeModal(): JSX.Element | null {
        if (!this.state.showFixTheCode) {
            return null;
        }
        return <Modal show={true} onHide={() => { this.setState({ showFixTheCode: false }) }} animation={false} backdrop='static' >
            <Modal.Header closeButton>
                <Modal.Title>{_T("Fix the code?")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {_T("FIX_THE_CODE_MESSAGE")}
                    <span>&nbsp;</span>
                    <strong>
                        {_T("FIX_THE_CODE_WARNING")}
                    </strong>
                </p>
                <br />
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-default"
                    onClick={() => {
                        const correctCode = this.state.currentStep!.resultCode;
                        this.setState({ showFixTheCode: false });
                        this.flowService.code = correctCode;
                        this.flowService.runCurrentProgram();
                    }}>
                    <span> {_T("Yes, fix my code")}</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { this.setState({ showFixTheCode: false }) }}>
                    <span> {_T("No, keep my code as is")}</span>
                </button>
            </Modal.Footer>
        </Modal>
    }
}