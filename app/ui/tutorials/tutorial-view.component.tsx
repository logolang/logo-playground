import * as React from "react";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import {
  ITutorialInfo,
  ITutorialsContentService,
  ITutorialStepInfo,
  ITutorialStepContent
} from "app/services/tutorials/tutorials-content-service";
import { _T } from "app/services/customizations/localization.service";
import { TutorialSelectModalComponent } from "app/ui/tutorials/tutorial-select-modal.component";
import { PageLoadingIndicatorComponent } from "app/ui/_generic/page-loading-indicator.component";
import { ModalComponent } from "app/ui/_generic/modal.component";

import "./tutorial-view.component.scss";

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
  onNavigateRequest(tutorialId: string, stepId: string): void;
  tutorials: ITutorialInfo[];
  currentTutorialId: string;
  currentStepId: string;
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
  @lazyInject(ITutorialsContentService) private tutorialsLoader: ITutorialsContentService;
  @lazyInject(INotificationService) private notificationService: INotificationService;

  constructor(props: ITutorialViewComponentProps) {
    super(props);

    this.state = {
      isLoading: true,
      showSelectionTutorials: false,
      showFixTheCode: false
    };
  }

  async componentDidMount() {
    await this.loadData(this.props);
  }

  async componentWillReceiveProps(nextProps: ITutorialViewComponentProps) {
    if (
      this.props.currentTutorialId !== nextProps.currentTutorialId ||
      this.props.currentStepId !== nextProps.currentStepId
    ) {
      await this.loadData(nextProps);
    }
  }

  loadData = async (props: ITutorialViewComponentProps) => {
    this.setState({ isLoading: true });

    //calculate stepIndex
    const currentTutorial = this.props.tutorials.find(x => x.id === this.props.currentTutorialId);
    if (!currentTutorial) {
      throw new Error("Can't find tutorial " + this.props.currentTutorialId);
    }
    const currentStepIndex = currentTutorial.steps.findIndex(x => x.id === this.props.currentStepId);
    if (currentStepIndex < 0) {
      throw new Error("Can't find step " + this.props.currentStepId);
    }
    const currentStepInfo = currentTutorial.steps[currentStepIndex];

    const currentStepContent = await this.tutorialsLoader.getStep(props.currentTutorialId, props.currentStepId);
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
        {this.state.isLoading && <PageLoadingIndicatorComponent isLoading={true} />}
        {!this.state.isLoading &&
          this.state.currentStepInfo &&
          this.state.currentStepContent &&
          this.state.currentStepIndex !== undefined &&
          this.state.currentTutorial && (
            <div className="tutorial-content">
              {this.renderFixTheCodeModal()}
              {this.renderSelectTutorialModal()}

              <button
                className="button is-info is-pulled-right"
                onClick={() => {
                  this.setState({ showSelectionTutorials: true });
                }}
              >
                <span>{this.state.currentTutorial.label}</span>
                <span className="icon is-small">
                  <i className="fa fa-angle-down" aria-hidden="true" />
                </span>
              </button>

              <span className="subtitle is-3">{this.state.currentStepInfo.name}</span>

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
    if (!this.state.showSelectionTutorials || !this.state.currentTutorial || !this.state.currentStepInfo) {
      return null;
    }
    return (
      <TutorialSelectModalComponent
        tutorials={this.props.tutorials}
        currentTutorialId={this.props.currentTutorialId}
        currentStepId={this.props.currentStepId}
        onCancel={() => {
          this.setState({ showSelectionTutorials: false });
        }}
        onSelect={tutorial => {
          this.setState({ showSelectionTutorials: false });
          this.props.onNavigateRequest(tutorial.id, tutorial.steps[0].id);
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
        cancelButtonText={_T("No, keep my code as is")}
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
    return () => {
      if (this.state.currentStepInfo && this.state.currentTutorial && this.state.currentStepIndex !== undefined) {
        const newStepIndex = this.state.currentStepIndex + direction;
        this.props.onNavigateRequest(this.state.currentTutorial.id, this.state.currentTutorial.steps[newStepIndex].id);
      }
    };
  };
}
