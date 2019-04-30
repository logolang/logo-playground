import * as React from "react";

import { $T } from "i18n-strings";
import { resolve } from "utils/di";
import { TutorialInfo, TutorialStepInfo, TutorialStepContent } from "services/tutorials-service";

import { TutorialSelectModal } from "ui/tutorials/tutorial-select-modal";
import { Modal } from "ui/_generic/modal";

import "./tutorial-view.less";

export interface Props {
  tutorials: TutorialInfo[];
  currentTutorialInfo: TutorialInfo;
  currentStepInfo: TutorialStepInfo;
  currentStepContent: TutorialStepContent;
  onFixTheCode(): void;
  onNavigationRequest(tutorialId: string, stepId: string): void;
}

interface State {
  showSelectionTutorials: boolean;
  showFixTheCode: boolean;
}

export class TutorialView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showSelectionTutorials: false,
      showFixTheCode: false
    };
  }

  render(): JSX.Element {
    const currentStepIndex = this.props.currentTutorialInfo.steps.findIndex(
      x => x.id === this.props.currentStepInfo.id
    );
    const nextStepButtonDisabled =
      currentStepIndex >= this.props.currentTutorialInfo.steps.length - 1;
    const prevStepButtonDisabled = currentStepIndex <= 0;

    return (
      <div className="tutorial-view-panel">
        <div className="tutorial-content">
          {this.renderFixTheCodeModal()}
          {this.renderSelectTutorialModal()}

          <div className="tutorial-header">
            <span className="subtitle is-3 is-marginless">{this.props.currentStepInfo.name}</span>
            <button
              className="button is-info"
              onClick={() => {
                this.setState({ showSelectionTutorials: true });
              }}
            >
              <span>{this.props.currentTutorialInfo.label}</span>
              <span className="icon is-small">
                <i className="fa fa-angle-down" aria-hidden="true" />
              </span>
            </button>
          </div>

          <p className="help">
            {$T.tutorial.stepIndicator.val(
              (currentStepIndex + 1).toString(),
              this.props.currentTutorialInfo.steps.length.toString()
            )}
          </p>
          <br />

          <div
            className="content"
            dangerouslySetInnerHTML={{
              __html: this.props.currentStepContent.content
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

            {this.props.currentStepContent.solutionCode && (
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
              <button
                type="button"
                className="button is-primary"
                onClick={this.navigateToNextStep(1)}
              >
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
      </div>
    );
  }

  renderSelectTutorialModal() {
    if (!this.state.showSelectionTutorials) {
      return;
    }
    return (
      <TutorialSelectModal
        tutorials={this.props.tutorials}
        currentTutorialId={this.props.currentTutorialInfo.id}
        currentStepId={this.props.currentStepInfo.id}
        onCancel={() => {
          this.setState({ showSelectionTutorials: false });
        }}
        onSelect={async tutorial => {
          this.setState({ showSelectionTutorials: false });
          this.props.onNavigationRequest(tutorial.id, tutorial.steps[0].id);
        }}
      />
    );
  }

  renderFixTheCodeModal() {
    if (!this.state.showFixTheCode) {
      return;
    }
    return (
      <Modal
        show
        title={$T.tutorial.fixTheCodeTitle}
        actionButtonText={$T.tutorial.yesFixMyCode}
        cancelButtonText={$T.tutorial.noLeaveItAsIs}
        onConfirm={async () => {
          this.setState({ showFixTheCode: false });
          this.props.onFixTheCode();
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
      </Modal>
    );
  }

  navigateToNextStep = (direction: number) => {
    return async () => {
      const currentStepIndex = this.props.currentTutorialInfo.steps.findIndex(
        x => x.id === this.props.currentStepInfo.id
      );
      const newStepIndex = currentStepIndex + direction;
      const newStepId = this.props.currentTutorialInfo.steps[newStepIndex].id;
      this.props.onNavigationRequest(this.props.currentTutorialInfo.id, newStepId);
    };
  };
}
