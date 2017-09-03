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
import { ModalComponent } from "app/ui/_generic/modal.component";

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
        {this.state.isLoading && <PageLoadingIndicatorComponent isLoading={true} />}
        {!this.state.isLoading &&
        this.state.currentStep &&
        this.state.currentTutorial && (
          <div className="tutorial-content">
            {this.renderFixTheCodeModal()}
            {this.renderSelectTutorialModal()}

            <button
              className="button is-info"
              onClick={() => {
                this.setState({ showSelectionTutorials: true });
              }}
            >
              <span>{this.state.currentTutorial.label}</span>
              <span className="icon is-small">
                <i className="fa fa-angle-down" aria-hidden="true" />
              </span>
            </button>

            <p className="help">
              {_T("Step %1$s of %2$s", {
                values: [this.state.currentStep.index + 1, this.state.currentTutorial.steps]
              })}
            </p>

            <div className="content" dangerouslySetInnerHTML={{ __html: this.state.currentStep.content }} />
            <br />
            <br />
            <div className="field is-grouped">
              <p className="control">
                {!prevStepButtonDisabled && (
                  <button type="button" className="button" onClick={this.navigateToNextStep(-1)}>
                    <span className="icon">
                      <i className="fa fa-arrow-left" aria-hidden="true" />
                    </span>
                    <span>Back</span>
                  </button>
                )}
              </p>
              <p className="control">
                {this.state.currentStep.resultCode && (
                  <button
                    type="button"
                    className="button is-warning"
                    onClick={() => {
                      this.setState({ showFixTheCode: true });
                    }}
                  >
                    <span className="icon">
                      <i className="fa fa-question" aria-hidden="true" />
                    </span>
                    <span>{_T("Help – it's not working!")}</span>
                  </button>
                )}
              </p>
              <p className="control">
                {!nextStepButtonDisabled && (
                  <button type="button" className="button is-primary" onClick={this.navigateToNextStep(1)}>
                    <span className="icon">
                      <i className="fa fa-arrow-right" aria-hidden="true" />
                    </span>
                    <span>{_T("Continue")}</span>
                  </button>
                )}
              </p>
              <p className="control">
                {nextStepButtonDisabled && (
                  <button
                    type="button"
                    className="button is-primary"
                    onClick={() => {
                      this.setState({ showSelectionTutorials: true });
                    }}
                  >
                    <span className="icon">
                      <i className="fa fa-arrow-right" aria-hidden="true" />
                    </span>
                    <span>{_T("Choose another tutorial")}</span>
                  </button>
                )}
              </p>
            </div>
            <div />
          </div>
        )}
      </div>
    );
  }

  renderSelectTutorialModal(): JSX.Element | null {
    if (!this.state.showSelectionTutorials || !this.state.currentTutorial || !this.state.currentStep) {
      return null;
    }
    return (
      <TutorialSelectModalComponent
        tutorials={this.state.tutorials}
        currentTutorialId={this.state.currentTutorial.id}
        currentStepIndex={this.state.currentStep.index}
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
      />
    );
  }

  renderFixTheCodeModal(): JSX.Element | null {
    if (!this.state.showFixTheCode || !this.state.currentStep) {
      return null;
    }
    const currentStep = this.state.currentStep;
    return (
      <ModalComponent
        show
        title={_T("Fix the code?")}
        actionButtonText={_T("Yes, fix my code")}
        cancelButtonText={_T("No, keep my code as is")}
        onConfirm={async () => {
          this.setState({ showFixTheCode: false });
          this.props.fixTheCodeStream.next(currentStep.resultCode);
        }}
        onCancel={() => {
          this.setState({ showFixTheCode: false });
        }}
      >
        <p>
          {_T("FIX_THE_CODE_MESSAGE")}
          <span>&nbsp;</span>
          <strong>{_T("FIX_THE_CODE_WARNING")}</strong>
        </p>
      </ModalComponent>
    );
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
