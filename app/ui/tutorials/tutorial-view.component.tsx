import * as React from "react";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import {
  ITutorialInfo,
  ITutorialsContentService,
  ITutorialStepInfo,
  ITutorialStepContent
} from "app/services/tutorials/tutorials-content-service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { ErrorDef, callActionSafe } from "app/utils/error-helpers";

import { TutorialSelectModalComponent } from "app/ui/tutorials/tutorial-select-modal.component";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import "./tutorial-view.component.less";

export interface ITutorialRequestData {
  tutorialId: string;
  stepId: string;
}

export interface ITutorialLoadedData {
  stepName: string;
  code: string;
}

export interface ITutorialNavigationRequest {
  tutorialId: string;
  stepId: string;
}

export interface ITutorialViewComponentProps {
  onFixTheCode(newCode: string): void;
  onLoadedTutorial(tutorialId: string, stepId: string, initCode: string): void;
  tutorials: ITutorialInfo[];
  initialTutorialId: string;
  initialStepId: string;
}

interface IComponentState {
  isLoading: boolean;
  currentTutorial?: ITutorialInfo;
  currentStepInfo?: ITutorialStepInfo;
  currentStepContent?: ITutorialStepContent;
  currentStepIndex?: number;
  showSelectionTutorials: boolean;
  showFixTheCode: boolean;
}

export class TutorialViewComponent extends React.Component<ITutorialViewComponentProps, IComponentState> {
  private tutorialsLoader = resolveInject(ITutorialsContentService);
  private notificationService = resolveInject(INotificationService);
  private eventsTracking = resolveInject(IEventsTrackingService);

  constructor(props: ITutorialViewComponentProps) {
    super(props);

    this.state = {
      isLoading: true,
      showSelectionTutorials: false,
      showFixTheCode: false
    };
  }

  private errorHandler = (err: ErrorDef) => {
    this.notificationService.push({ message: err.message, type: "danger" });
  };

  async componentDidMount() {
    await this.loadTutorial(this.props.initialTutorialId, this.props.initialStepId);
  }

  loadTutorial = async (tutorialId: string, stepId: string) => {
    this.setState({ isLoading: true });

    //calculate stepIndex
    const currentTutorial = this.props.tutorials.find(x => x.id === tutorialId);
    if (!currentTutorial) {
      throw new Error("Can't find tutorial " + tutorialId);
    }
    const currentStepIndex = currentTutorial.steps.findIndex(x => x.id === stepId);
    if (currentStepIndex < 0) {
      throw new Error("Can't find step " + stepId);
    }
    const currentStepInfo = currentTutorial.steps[currentStepIndex];

    const currentStepContent = await callActionSafe(this.errorHandler, async () =>
      this.tutorialsLoader.getStep(tutorialId, stepId)
    );
    if (!currentStepContent) {
      return;
    }

    this.setState({
      isLoading: false,
      currentStepContent,
      currentStepIndex,
      currentTutorial,
      currentStepInfo
    });

    this.props.onLoadedTutorial(tutorialId, stepId, currentStepContent.initialCode);
  };

  render(): JSX.Element {
    let nextStepButtonDisabled = true;
    let prevStepButtonDisabled = true;
    if (this.state.currentTutorial && this.state.currentStepInfo && this.state.currentStepIndex !== undefined) {
      nextStepButtonDisabled = this.state.currentStepIndex >= this.state.currentTutorial.steps.length - 1;
      prevStepButtonDisabled = this.state.currentStepIndex <= 0;
    }

    return (
      <div className="tutorial-view-panel">
        <LoadingComponent isLoading={this.state.isLoading} />
        {!this.state.isLoading &&
          this.state.currentStepInfo &&
          this.state.currentStepContent &&
          this.state.currentStepIndex !== undefined &&
          this.state.currentTutorial && (
            <div className="tutorial-content">
              {this.renderFixTheCodeModal()}
              {this.renderSelectTutorialModal()}

              <div className="tutorial-header">
                <span className="subtitle is-3 is-marginless">{this.state.currentStepInfo.name}</span>
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
              </div>

              <p className="help">
                {_T("Step %1$s of %2$s", {
                  values: [this.state.currentStepIndex + 1, this.state.currentTutorial.steps.length]
                })}
              </p>
              <br />

              <div
                className="content"
                dangerouslySetInnerHTML={{
                  __html: this.state.currentStepContent.content
                }}
              />
              <br />
              <br />
              <div className="tutorials-bottom-nav-buttons-container">
                {!prevStepButtonDisabled && (
                  <button type="button" className="button" onClick={this.navigateToNextStep(-1)}>
                    <span className="icon">
                      <i className="fa fa-arrow-left" aria-hidden="true" />
                    </span>
                    <span>{_T("Back")}</span>
                  </button>
                )}

                {this.state.currentStepContent.resultCode && (
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

                {!nextStepButtonDisabled && (
                  <button type="button" className="button is-primary" onClick={this.navigateToNextStep(1)}>
                    <span className="icon">
                      <i className="fa fa-arrow-right" aria-hidden="true" />
                    </span>
                    <span>{_T("Continue")}</span>
                  </button>
                )}

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
              </div>
              <div />
            </div>
          )}
      </div>
    );
  }

  renderSelectTutorialModal(): JSX.Element | null {
    if (!this.state.showSelectionTutorials || !this.state.currentTutorial || !this.state.currentStepInfo) {
      return null;
    }
    return (
      <TutorialSelectModalComponent
        tutorials={this.props.tutorials}
        currentTutorialId={this.state.currentTutorial.id}
        currentStepId={this.state.currentStepInfo.id}
        onCancel={() => {
          this.setState({ showSelectionTutorials: false });
        }}
        onSelect={async tutorial => {
          this.eventsTracking.sendEvent(EventAction.tutorialsStart);
          this.setState({ showSelectionTutorials: false });
          await this.loadTutorial(tutorial.id, tutorial.steps[0].id);
        }}
      />
    );
  }

  renderFixTheCodeModal(): JSX.Element | null {
    if (!this.state.showFixTheCode || !this.state.currentStepContent) {
      return null;
    }
    const currentStep = this.state.currentStepContent;
    return (
      <ModalComponent
        show
        title={_T("Fix the code?")}
        actionButtonText={_T("Yes, fix my code")}
        cancelButtonText={_T("No, leave it as is")}
        onConfirm={async () => {
          this.setState({ showFixTheCode: false });
          this.props.onFixTheCode(currentStep.resultCode);
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
    return async () => {
      if (this.state.currentStepInfo && this.state.currentTutorial && this.state.currentStepIndex !== undefined) {
        this.eventsTracking.sendEvent(direction > 0 ? EventAction.tutorialsNext : EventAction.tutorialsBack);

        const newStepIndex = this.state.currentStepIndex + direction;
        const newStepId = this.state.currentTutorial.steps[newStepIndex].id;
        this.setState({ isLoading: true });
        await this.loadTutorial(this.state.currentTutorial.id, newStepId);
      }
    };
  };
}
