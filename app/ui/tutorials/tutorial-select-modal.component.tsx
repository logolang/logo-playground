import * as React from "react";
import * as cn from "classnames";
import { ITutorialInfo } from "app/services/tutorials/tutorials-content-service";
import { _T } from "app/services/customizations/localization.service";
import { ModalComponent } from "app/ui/_generic/modal.component";

import "./tutorial-select-modal.component.less";

interface IComponentState {
  currentSelectedTutorial: ITutorialInfo;
}

interface IComponentProps {
  currentTutorialId: string;
  currentStepId: string;
  tutorials: ITutorialInfo[];
  onSelect: (tutorial: ITutorialInfo) => void;
  onCancel: () => void;
}

export class TutorialSelectModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    const selectedTutorial = this.props.tutorials.find(t => t.id === this.props.currentTutorialId);
    if (!selectedTutorial) {
      throw new Error("Tutorial is not found " + this.props.currentTutorialId);
    }
    this.state = {
      currentSelectedTutorial: selectedTutorial
    };
  }

  onSelect = (tutorial: ITutorialInfo) => {
    this.setState({
      currentSelectedTutorial: tutorial
    });
  };

  start() {
    if (this.state.currentSelectedTutorial.id === this.props.currentTutorialId) {
      this.props.onCancel();
    } else {
      this.props.onSelect(this.state.currentSelectedTutorial);
    }
  }

  render(): JSX.Element | null {
    const selectedTutorial = this.state.currentSelectedTutorial;
    return (
      <ModalComponent
        show
        width="medium"
        title={_T("Choose a tutorial")}
        onCancel={this.props.onCancel}
        actionButtonText={selectedTutorial.id === this.props.currentTutorialId ? _T("Continue") : _T("Start")}
        onConfirm={async () => {
          this.start();
        }}
      >
        <div className="tutorial-select-modal-component">
          <div className="columns">
            <div className="column is-5 tutorial-pick-menu-container">
              <aside className="menu">
                <p className="menu-label">General</p>
                <ul className="menu-list">
                  {this.props.tutorials.map((t, i) => (
                    <li key={i}>
                      <a
                        className={cn({
                          "is-active": t.id === selectedTutorial.id
                        })}
                        onClick={() => this.onSelect(t)}
                      >
                        {this.props.currentTutorialId === t.id ? <strong>{t.label}</strong> : <span>{t.label}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
            <div className="column is-7 tutorial-description-container">
              <div className="card">
                <div className="card-content">
                  <p className="title">{selectedTutorial.label}</p>
                  {selectedTutorial.id === this.props.currentTutorialId && (
                    <div className="help">
                      <p>You currently is in progress with this tutorial</p>
                      <br />
                    </div>
                  )}
                  <p>{selectedTutorial.description}</p>
                  <br />
                  <ul className="steps-list">
                    {selectedTutorial.steps.map(s => (
                      <li key={s.id}>
                        {s.id === this.props.currentStepId && selectedTutorial.id === this.props.currentTutorialId ? (
                          <strong>{s.name}</strong>
                        ) : (
                          <span>{s.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalComponent>
    );
  }
}
