import * as React from "react";

import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { NotificationService } from "app/services/infrastructure/notification.service";
import {
  ITutorialInfo,
  TutorialsContentService,
  ITutorialStepInfo,
  ITutorialStepContent
} from "app/services/tutorials/tutorials-content-service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { callActionSafe } from "app/utils/error-helpers";
import { ErrorService } from "app/services/infrastructure/error.service";

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
  private tutorialsLoader = resolveInject(TutorialsContentService);
  private notificationService = resolveInject(NotificationService);
  private errorService = resolveInject(ErrorService);
  private eventsTracking = resolveInject(EventsTrackingService);

  constructor(props: ITutorialViewComponentProps) {
    super(props);

    this.state = {
      isLoading: true,
      showSelectionTutorials: false,
      showFixTheCode: false
    };
  }

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

    const currentStepContent = await callActionSafe(this.errorService.handleError, async () =>
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
                {$T.tutorial.stepIndicator.val(
                  (this.state.currentStepIndex + 1).toString(),
                  this.state.currentTutorial.steps.length.toString()
                )}
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
                    <span>{$T.tutorial.back}</span>
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
                    <span>{$T.tutorial.helpItsNotworking}</span>
                  </button>
                )}

                {!nextStepButtonDisabled && (
                  <button type="button" className="button is-primary" onClick={this.navigateToNextStep(1)}>
                    <span className="icon">
                      <i className="fa fa-arrow-right" aria-hidden="true" />
                    </span>
                    <span>{$T.common.continue}</span>
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
                    <span>{$T.tutorial.chooseAnotherTutorial}</span>
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
        title={$T.tutorial.fixTheCodeTitle}
        actionButtonText={$T.tutorial.yesFixMyCode}
        cancelButtonText={$T.tutorial.noLeaveItAsIs}
        onConfirm={async () => {
          this.setState({ showFixTheCode: false });
          this.props.onFixTheCode(currentStep.resultCode);
        }}
        onCancel={() => {
          this.setState({ showFixTheCode: false });
        }}
      >
        <p>
          {$T.tutorial.fixTheCodeMessage}
          <span>&nbsp;</span>
          <strong>{$T.tutorial.fixTheCodeWarning}</strong>
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
