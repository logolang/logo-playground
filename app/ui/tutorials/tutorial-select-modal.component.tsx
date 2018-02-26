import * as React from "react";
import * as cn from "classnames";
import { ITutorialInfo } from "app/services/tutorials/tutorials-content-service";
import { _T } from "app/services/customizations/localization.service";
import { ModalComponent } from "app/ui/_generic/modal.component";
import { CollapsiblePanelComponent } from "../_generic/collapsible-panel.component";
import { DictionaryLike } from "app/utils/syntax-helpers";

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
    const groups: DictionaryLike<ITutorialInfo[]> = {};
    this.props.tutorials.forEach(t => (groups[t.level] = [...(groups[t.level] || []), t]));

    return (
      <ModalComponent
        show
        width="default"
        title={_T("Choose a tutorial")}
        onCancel={this.props.onCancel}
        actionButtonText={
          this.state.currentSelectedTutorial.id === this.props.currentTutorialId ? _T("Continue") : _T("Start")
        }
        onConfirm={async () => {
          this.start();
        }}
      >
        <div className="tutorial-select-modal-component tutorial-pick-menu-container">
          <aside className="menu">
            {Object.entries(groups).map(([groupName, tutorials]) => this.renderTutorialsGroup(groupName, tutorials))}
          </aside>
        </div>
      </ModalComponent>
    );
  }

  renderTutorialsGroup(groupName: string, tutorials: ITutorialInfo[]) {
    const selectedTutorial = this.state.currentSelectedTutorial;
    return (
      <React.Fragment key={groupName}>
        <p className="menu-label">{groupName}</p>
        <ul className="menu-list">
          {tutorials.map((t, i) => (
            <React.Fragment key={i}>
              <li>
                <a
                  className={cn("tutorial-link", {
                    "is-active": t.id === selectedTutorial.id
                  })}
                  onClick={() => this.onSelect(t)}
                >
                  <i className="fa fa-arrow-circle-right" aria-hidden="true" />{" "}
                  {selectedTutorial.id === t.id ? <strong>{t.label}</strong> : <span>{t.label}</span>}
                </a>

                <CollapsiblePanelComponent
                  className="tutorial-description-container"
                  isCollapsed={selectedTutorial.id !== t.id}
                >
                  <p className="tutorial-description">{t.description}</p>
                  <ul>
                    <li>
                      <ol>
                        {t.steps
                          .slice(0, t.steps.length - 1)
                          .map(s => (
                            <li key={s.id}>
                              {s.id === this.props.currentStepId &&
                              selectedTutorial.id === this.props.currentTutorialId ? (
                                <strong>{s.name}</strong>
                              ) : (
                                <span>{s.name}</span>
                              )}
                            </li>
                          ))}
                      </ol>
                    </li>
                  </ul>
                  <br />
                </CollapsiblePanelComponent>
              </li>
            </React.Fragment>
          ))}
        </ul>
      </React.Fragment>
    );
  }
}
