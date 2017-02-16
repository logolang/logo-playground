import * as React from 'react';
import { Link } from 'react-router'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs'

import { handleError } from 'app/utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { ErrorMessageComponent } from 'app/ui//shared/generic/error-message.component';
import { PageLoadingIndicatorComponent } from 'app/ui//shared/generic/page-loading-indicator.component';
import { CodeInputLogoComponent } from './shared/code-input-logo.component';
import { LogoExecutorComponent } from './shared/logo-executor.component';

import { ITutorialInfo, ITutorialStep } from 'app/services/tutorials-content-service';

import './tutorials.component.scss';

interface IComponentState {
    isLoading: boolean
    errorMessage: string
    tutorials: ITutorialInfo[]
    currentTutorial: ITutorialInfo | undefined
    steps: ITutorialStep[]
    currentStep: ITutorialStep | undefined

    isRunning: boolean
    currentCode: string
}

interface IComponentProps {
}

export class TutorialsComponent extends React.Component<IComponentProps, IComponentState> {
    private tutorialsLoader = ServiceLocator.resolve(x => x.tutorialsService);
    private runCode = new Subject<string>();
    private stopCode = new Subject<void>();

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isLoading: true,
            errorMessage: '',
            tutorials: [],
            currentTutorial: undefined,

            steps: [],
            currentStep: undefined,

            isRunning: false,
            currentCode: ''
        };
    }

    componentDidMount() {
        this.loadData('01', 0);
    }

    private async loadData(tutorialIdToLoad: string, stepIndexToLoad: number) {
        this.setState({ isLoading: true });
        const tutorialInfos = await handleError(this, () => this.tutorialsLoader.getTutorialsList());
        if (tutorialInfos) {
            const currentTutorial = tutorialInfos.find(t => t.id === tutorialIdToLoad);
            this.setState({ tutorials: tutorialInfos, currentTutorial: currentTutorial });

            const steps = await handleError(this, () => this.tutorialsLoader.getSteps(currentTutorial.id));
            if (steps) {
                this.setState({ steps: steps, currentStep: steps[stepIndexToLoad] });
            }
        }
        this.setState({ isLoading: false });
    }

    render(): JSX.Element {
        let nextStepButtonDisabled = true;
        let prevStepButtonDisabled = true;
        if (this.state.currentStep) {
            nextStepButtonDisabled = this.state.currentStep.index >= this.state.steps.length - 1;
            prevStepButtonDisabled = this.state.currentStep.index <= 0;
        }

        return (
            <div className="container-fluid">
                <MainMenuComponent />
                <PageLoadingIndicatorComponent isLoading={this.state.isLoading}>
                    <ErrorMessageComponent errorMessage={this.state.errorMessage} />
                    {
                        (this.state.tutorials.length > 0 && this.state.currentTutorial) &&
                        <div>
                            <div className="row">
                                <div className="col-sm-6">
                                    {
                                        this.state.currentStep &&
                                        <div className="panel panel-default">
                                            <div className="panel-heading current-step-panel-header-container">
                                                <table className="ex-background-transparent">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="tutorials-selector-container">
                                                                    <DropdownButton className="btn btn-primary btn"
                                                                        title={<span>Tutorial: {this.state.currentTutorial.name}&nbsp;&nbsp;</span> as any}
                                                                        id="tutorials-selector">
                                                                        {
                                                                            this.state.tutorials.map(t => <MenuItem
                                                                                key={t.id}
                                                                                onClick={() => {
                                                                                    this.setState({ currentTutorial: t });
                                                                                    this.loadData(t.id, 0);
                                                                                }}
                                                                            >
                                                                                <div className="tutorial-drop-menu-item">
                                                                                    <h4>{t.name}</h4>
                                                                                    <div>{t.description} ({t.steps} steps)</div>
                                                                                    <hr />
                                                                                </div>
                                                                            </MenuItem>)
                                                                        }
                                                                    </DropdownButton>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <button type="button" className="btn btn-default step-nav-btn" disabled={prevStepButtonDisabled}
                                                                    onClick={() => { this.setState({ currentStep: this.state.steps[this.state.currentStep!.index - 1] }) }}>
                                                                    <span className="glyphicon glyphicon-triangle-left" aria-hidden="true"></span>
                                                                </button>
                                                            </td>
                                                            <td style={{ width: '70%' }}>
                                                                <span>Step {this.state.currentStep.index + 1} of {this.state.currentTutorial.steps}</span>
                                                            </td>
                                                            <td>
                                                                <button type="button" className="btn btn-default step-nav-btn" disabled={nextStepButtonDisabled}
                                                                    onClick={() => { this.setState({ currentStep: this.state.steps[this.state.currentStep!.index + 1] }) }}>
                                                                    <span className="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="panel-body">
                                                {
                                                    <div>
                                                        <h3>{this.state.currentStep.name}</h3>
                                                        <p>
                                                            {this.state.currentStep.content}
                                                        </p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    }
                                    <div className="panel panel-default">
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
                                <div className="col-sm-6">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
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
                                        <div className="panel-body source-input-panel">
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
                    }
                </PageLoadingIndicatorComponent>
            </div>
        );
    }
}