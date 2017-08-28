import * as React from "react";
import { Observable, Subject } from "rxjs";
import { ISubscription } from "rxjs/Subscription";

import { lazyInject } from "app/di";
import {
  ITutorialInfo,
  ITutorialStep,
  ITutorialsContentService
} from "app/services/tutorials/tutorials-content-service";
import { _T } from "app/services/customizations/localization.service";
import { TutorialSelectModalComponent } from "app/ui/tutorials/tutorial-select-modal.component";
import { PageLoadingIndicatorComponent } from "app/ui/_generic/page-loading-indicator.component";
import { OpacityGradientComponent } from "app/ui/_generic/opacity-gradient.component";

import "./tutorial-view.component.scss";

export interface ITutorialRequestData {
  tutorialId: string;
  stepIndex: number;
  code: string;
}

export interface ITutorialLoadedData {
  stepName: string;
  code: string;
}

export interface ITutorialNavigationRequest {
  tutorialId: string;
  stepIndex: number;
}

export interface ITutorialViewComponentProps {
  tutorialLoadRequest: Observable<ITutorialRequestData>;
  tutorialLoadedStream: Subject<ITutorialLoadedData>;
  tutorialNavigationStream: Subject<ITutorialNavigationRequest>;
  fixTheCodeStream: Subject<string>;
}

interface IComponentState {
  isLoading: boolean;
  tutorials: ITutorialInfo[];
  currentTutorial: ITutorialInfo | undefined;
  steps: ITutorialStep[];
  currentStep: ITutorialStep | undefined;
  showSelectionTutorials: boolean;
  showFixTheCode: boolean;
}

export class TutorialViewComponent extends React.Component<ITutorialViewComponentProps, IComponentState> {
  @lazyInject(ITutorialsContentService) private tutorialsLoader: ITutorialsContentService;

  private subscriptions: ISubscription[] = [];

  constructor(props: ITutorialViewComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      tutorials: [],
      currentTutorial: undefined,
      steps: [],
      currentStep: undefined,
      showSelectionTutorials: false,
      showFixTheCode: false
    };
  }

  componentDidMount() {
    this.subscriptions.push(this.props.tutorialLoadRequest.subscribe(this.loadData));
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadData = async (data: ITutorialRequestData) => {
    console.log("loadData tutorial", data);

    this.setState({ isLoading: true });
    const tutorialInfos = await this.tutorialsLoader.getTutorialsList();
    if (!tutorialInfos) {
      return;
    }
    const tutorialId = data.tutorialId;
    let stepIndex = data.stepIndex;
    let currentTutorial = tutorialInfos.find(t => t.id === tutorialId);
    if (!currentTutorial) {
      //throw new Error(`Can't find tutorial with id ${tutorialId}`);
      currentTutorial = tutorialInfos[0];
      stepIndex = 0;
    }
    const steps = await this.tutorialsLoader.getSteps(currentTutorial.id);
    if (!steps) {
      return;
    }

    const currentStep = steps[stepIndex];

    this.setState({
      isLoading: false,
      tutorials: tutorialInfos,
      steps: steps,
      currentTutorial: currentTutorial,
      currentStep: currentStep
    });

    this.props.tutorialLoadedStream.next({
      code: currentStep.initialCode,
      stepName: currentStep.name
    });
  };

  render(): JSX.Element {
    let nextStepButtonDisabled = true;
    let prevStepButtonDisabled = true;
    if (this.state.currentStep) {
      nextStepButtonDisabled = this.state.currentStep.index >= this.state.steps.length - 1;
      prevStepButtonDisabled = this.state.currentStep.index <= 0;
    }

    return (
      <div className="tutorial-view-panel">
        {this.renderFixTheCodeModal()}
        {this.state.showSelectionTutorials &&
          <TutorialSelectModalComponent
            tutorials={this.state.tutorials}
            onCancel={() => {
              this.setState({ showSelectionTutorials: false });
            }}
            onSelect={tutorialId => {
              this.setState({ showSelectionTutorials: false });
              this.props.tutorialNavigationStream.next({
                tutorialId: tutorialId,
                stepIndex: 0
              });
            }}
          />}

        {this.state.isLoading && <PageLoadingIndicatorComponent isLoading={true} />}
        {!this.state.isLoading &&
          this.state.currentStep &&
          this.state.currentTutorial &&
          <div className="current-step-panel-container">
            <div className="current-step-panel panel-default">
              <div className="current-step-panel-heading">
                <div className="tutorials-selector-container">
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      this.setState({ showSelectionTutorials: true });
                    }}
                  >
                    <span>
                      {this.state.currentTutorial.label}&nbsp;&nbsp;
                    </span>
                    <span className="caret" />
                  </button>
                </div>
                <div className="prev-btn-container">
                  <button
                    type="button"
                    className="btn btn-default step-nav-btn"
                    disabled={prevStepButtonDisabled}
                    onClick={this.navigateToNextStep(-1)}
                  >
                    <span className="glyphicon glyphicon-triangle-left" aria-hidden="true" />
                  </button>
                </div>
                <div className="step-title-container">
                  <span>
                    {_T("Step %1$s of %2$s", {
                      values: [this.state.currentStep.index + 1, this.state.currentTutorial.steps]
                    })}
                  </span>
                </div>
                <div className="next-btn-container">
                  <button
                    type="button"
                    className="btn btn-default step-nav-btn"
                    disabled={nextStepButtonDisabled}
                    onClick={this.navigateToNextStep(1)}
                  >
                    <span className="glyphicon glyphicon-triangle-right" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="current-step-panel-body">
                {
                  <div className="current-step-panel-inner">
                    <div
                      className="step-content"
                      dangerouslySetInnerHTML={{ __html: this.state.currentStep.content }}
                    />
                    <div className="pull-right">
                      {this.state.currentStep.resultCode &&
                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={() => {
                            this.setState({ showFixTheCode: true });
                          }}
                        >
                          <span>
                            {_T("Help – it's not working!")}
                          </span>
                        </button>}
                      <span> </span>
                      {!nextStepButtonDisabled &&
                        <button type="button" className="btn btn-primary" onClick={this.navigateToNextStep(1)}>
                          <span>
                            {_T("Continue")}&nbsp;&nbsp;
                          </span>
                          <span className="glyphicon glyphicon-arrow-right" aria-hidden="true" />
                        </button>}
                      {nextStepButtonDisabled &&
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            this.setState({ showSelectionTutorials: true });
                          }}
                        >
                          <span>
                            {_T("Choose another tutorial")}&nbsp;&nbsp;
                          </span>
                          <span className="glyphicon glyphicon-arrow-right" aria-hidden="true" />
                        </button>}
                      <br />
                      <br />
                    </div>
                  </div>
                }
              </div>
              <OpacityGradientComponent className="bottom-opacity-gradient" />
            </div>
          </div>}
      </div>
    );
  }

  renderFixTheCodeModal(): JSX.Element | null {
    if (!this.state.showFixTheCode || !this.state.currentStep) {
      return null;
    }
    const currentStep = this.state.currentStep;
    return null;
    /*
    return (
      <Modal
        show={true}
        onHide={() => {
          this.setState({ showFixTheCode: false });
        }}
        animation={false}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {_T("Fix the code?")}
          </Modal.Title>
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
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              this.setState({ showFixTheCode: false });
              this.props.fixTheCodeStream.next(currentStep.resultCode);
            }}
          >
            <span>
              {_T("Yes, fix my code")}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setState({ showFixTheCode: false });
            }}
          >
            <span>
              {_T("No, keep my code as is")}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
    );*/
  }

  navigateToNextStep = (direction: number) => {
    return () => {
      if (this.state.currentStep && this.state.currentTutorial) {
        const newStepIndex = this.state.currentStep.index + direction;
        this.props.tutorialNavigationStream.next({
          tutorialId: this.state.currentTutorial.id,
          stepIndex: newStepIndex
        });
      }
    };
  };
}
