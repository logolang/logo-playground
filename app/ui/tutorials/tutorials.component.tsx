import * as React from 'react';
import { Link } from 'react-router'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs'

import { goTo, handleError, subscribeLoadDataOnPropsParamsChange } from 'app/utils/react-helpers';

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
import { ITutorialInfo, ITutorialStep } from "app/services/tutorials/tutorials-content-service";

import './tutorials.component.scss';

interface IComponentState {
    isLoading: boolean
    errorMessage: string
    tutorials: ITutorialInfo[]
    currentTutorial: ITutorialInfo | undefined
    steps: ITutorialStep[]
    currentStep: ITutorialStep | undefined

    showSelectionTutorials: boolean
    showFixTheCode: boolean
    isRunning: boolean
    currentCode: string
}

interface IComponentProps {
    params: ITutorialPageRouteParams
}

export interface ITutorialPageRouteParams {
    tutorialId: string,
    stepIndex: string
}

export class TutorialsComponent extends React.Component<IComponentProps, IComponentState> {
    private tutorialsLoader = ServiceLocator.resolve(x => x.tutorialsService);
    private runCode = new Subject<string>();
    private stopCode = new Subject<void>();

    constructor(props: IComponentProps) {
        super(props);
        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,
            errorMessage: '',
            tutorials: [],
            currentTutorial: undefined,

            steps: [],
            currentStep: undefined,

            showSelectionTutorials: false,
            showFixTheCode: false,
            isRunning: false,
            currentCode: ''
        };
        return state;
    }

    componentDidMount() {
        this.loadData(this.props);
    }

    async loadData(props: IComponentProps) {
        const tutorialIdToLoad = props.params.tutorialId || '01';
        const stepIndexToLoad = props.params.stepIndex || '01';

        let stepIndex = parseInt(stepIndexToLoad, 10);
        if (isNaN(stepIndex)) {
            throw new Error('Fail to parse step index. Should be valid integer');
        }
        stepIndex--;

        if (!this.state.currentTutorial || this.state.currentTutorial.id !== tutorialIdToLoad) {
            this.setState({ isLoading: true });
            const tutorialInfos = await handleError(this, () => this.tutorialsLoader.getTutorialsList());
            if (tutorialInfos) {
                const currentTutorial = tutorialInfos.find(t => t.id === tutorialIdToLoad);
                const steps = await handleError(this, () => this.tutorialsLoader.getSteps(currentTutorial.id));
                if (steps) {
                    this.setState({
                        tutorials: tutorialInfos,
                        currentTutorial: currentTutorial,
                        steps: steps
                    });
                }
            }
            this.setState({ isLoading: false });
        }
        this.setState(s => ({ currentStep: s.steps[stepIndex] }));
    }

    goNextStep = () => {
        let newStepIndex = this.state.currentStep!.index + 1;
        goTo(Routes.tutorialSpecified.build({
            tutorialId: this.state.currentTutorial!.id,
            stepIndex: (newStepIndex + 1).toString()
        }));
    }
    goPrevStep = () => {
        let newStepIndex = this.state.currentStep!.index - 1;
        goTo(Routes.tutorialSpecified.build({
            tutorialId: this.state.currentTutorial!.id,
            stepIndex: (newStepIndex + 1).toString()
        }));
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
                            this.setState({
                                currentTutorial: this.state.tutorials.find(t => t.id === tutorialId),
                                showSelectionTutorials: false
                            });
                            goTo(Routes.tutorialSpecified.build({ tutorialId: tutorialId, stepIndex: '01' }));
                        }}
                    />
                }
                <AlertMessageComponent message={this.state.errorMessage} />

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
                                                    <span>Tutorial: {this.state.currentTutorial.name}&nbsp;&nbsp;</span>
                                                    <span className="caret"></span>
                                                </button>
                                            </div>
                                            <div className="prev-btn-container">
                                                <button type="button" className="btn btn-default step-nav-btn" disabled={prevStepButtonDisabled}
                                                    onClick={this.goPrevStep}>
                                                    <span className="glyphicon glyphicon-triangle-left" aria-hidden="true"></span>
                                                </button>
                                            </div>
                                            <div className="step-title-container">
                                                <span>Step {this.state.currentStep.index + 1} of {this.state.currentTutorial.steps}</span>
                                            </div>
                                            <div className="next-btn-container">
                                                <button type="button" className="btn btn-default step-nav-btn" disabled={nextStepButtonDisabled}
                                                    onClick={this.goNextStep}>
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
                                                                <span>Help – it's not working!</span>
                                                            </button>
                                                        }
                                                        <span> </span>
                                                        {
                                                            (!nextStepButtonDisabled) &&
                                                            <button type="button" className="btn btn-primary"
                                                                onClick={this.goNextStep}>
                                                                <span>Continue&nbsp;&nbsp;</span>
                                                                <span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>
                                                            </button>
                                                        }
                                                        {
                                                            nextStepButtonDisabled &&
                                                            <button type="button" className="btn btn-primary"
                                                                onClick={() => { this.setState({ showSelectionTutorials: true }) }}>
                                                                <span>Choose another tutorial&nbsp;&nbsp;</span>
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
                                <LogoExecutorComponent
                                    height={200}
                                    onError={() => { }}
                                    onIsRunningChanged={(running) => { this.setState({ isRunning: running }) }}
                                    runCommands={this.runCode}
                                    stopCommands={this.stopCode}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ex-display-flex ex-flex-block">
                        <div className="source-input-panel panel panel-default">
                            <div className="source-input-panel-heading panel-heading">
                                {
                                    !this.state.isRunning &&
                                    <button type="button" className="btn btn-success"
                                        onClick={() => { this.runCode.next(this.state.currentCode) }}
                                    >
                                        Run <span className="glyphicon glyphicon-play" aria-hidden="true"> <small>(F9)</small></span>
                                    </button>
                                }
                                {
                                    this.state.isRunning &&
                                    <button type="button" className="btn btn-default"
                                        onClick={() => { this.stopCode.next() }}
                                    >
                                        Stop <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
                                    </button>
                                }
                            </div>
                            <div className="source-input-panel-body panel-body">
                                <CodeInputLogoComponent
                                    className="codemirror-input-logo"
                                    code={this.state.currentCode}
                                    onChanged={(code) => { this.setState({ currentCode: code }) }}
                                    focusCommands={new Subject<void>()}
                                    onHotkey={() => { }}
                                />
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
                <Modal.Title>Fix the code?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    If your code isn't working as the tutorial describes, you can replace it with a working version.
                    <strong> This will overwrite your code entirely.</strong>
                </p>
                <br />
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-default"
                    onClick={() => {
                        this.setState({
                            showFixTheCode: false,
                            currentCode: this.state.currentStep!.resultCode
                        });
                    }}>
                    <strong>Yes</strong>
                    <span>, fix my code</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { this.setState({ showFixTheCode: false }) }}>
                    <strong>No</strong>
                    <span>, keep my code as is</span>
                </button>
            </Modal.Footer>
        </Modal>
    }
}