import * as React from "react";
import * as cn from "classnames";
import { TutorialInfo } from "services/tutorials-service";
import { $T } from "i18n-strings";
import { Modal } from "ui/_generic/modal";
import { CollapsiblePanel } from "ui/_generic/collapsible-panel";
import { DictionaryLike } from "utils/syntax";

import "./tutorial-select-modal.less";

interface State {
  currentSelectedTutorial: TutorialInfo;
}

interface Props {
  currentTutorialId: string;
  currentStepId: string;
  tutorials: TutorialInfo[];
  onSelect(tutorial: TutorialInfo): void;
  onCancel(): void;
}

export class TutorialSelectModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const selectedTutorial = this.props.tutorials.find(t => t.id === this.props.currentTutorialId);
    if (!selectedTutorial) {
      throw new Error("Tutorial is not found " + this.props.currentTutorialId);
    }
    this.state = {
      currentSelectedTutorial: selectedTutorial
    };
  }

  onSelect = (tutorial: TutorialInfo) => {
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
    const groups: DictionaryLike<TutorialInfo[]> = {};
    for (const t of this.props.tutorials) {
      const level = t.level.toString();
      groups[level] = [...(groups[level] || []), t];
    }

    return (
      <Modal
        show
        width="default"
        title={$T.tutorial.chooseTutorial}
        onCancel={this.props.onCancel}
        cancelButtonText={$T.common.cancel}
        actionButtonText={
          this.state.currentSelectedTutorial.id === this.props.currentTutorialId
            ? $T.common.continue
            : $T.tutorial.start
        }
        onConfirm={async () => {
          this.start();
        }}
      >
        <div className="tutorial-select-modal-component tutorial-pick-menu-container">
          <aside className="menu">
            {Object.entries(groups).map(([groupLevel, tutorials]) =>
              this.renderTutorialsGroup(groupLevel, tutorials)
            )}
          </aside>
        </div>
      </Modal>
    );
  }

  getGroupName(level: string) {
    switch (level) {
      case "0":
        return $T.tutorial.tutorialsLevel0;
      case "1":
        return $T.tutorial.tutorialsLevel1;
    }
    return "UNKNOWN LEVEL";
  }

  renderTutorialsGroup(groupLevel: string, tutorials: TutorialInfo[]) {
    const selectedTutorial = this.state.currentSelectedTutorial;
    const groupName = this.getGroupName(groupLevel);
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
                  {selectedTutorial.id === t.id ? (
                    <strong>{t.label}</strong>
                  ) : (
                    <span>{t.label}</span>
                  )}
                </a>

                <CollapsiblePanel
                  className="tutorial-description-container"
                  isCollapsed={selectedTutorial.id !== t.id}
                >
                  <p className="tutorial-description">{t.description}</p>
                  <ul>
                    <li>
                      <ol>
                        {t.steps.slice(0, t.steps.length - 1).map(s => (
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
                </CollapsiblePanel>
              </li>
            </React.Fragment>
          ))}
        </ul>
      </React.Fragment>
    );
  }
}
