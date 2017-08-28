import * as React from "react";

import { ITutorialInfo } from "app/services/tutorials/tutorials-content-service";
import { _T } from "app/services/customizations/localization.service";

interface IComponentState {}

interface IComponentProps {
  tutorials: ITutorialInfo[];
  onSelect: (tutorialId: string) => void;
  onCancel: () => void;
}

export class TutorialSelectModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
  }

  onSelect = (tutorialId: string) => {
    return () => {
      this.props.onSelect(tutorialId);
    };
  };

  render(): JSX.Element | null {
    return null;
    /*
    return (
      <Modal show={true} onHide={this.props.onCancel} animation={false} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {_T("Choose a tutorial")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="list-group">
            {this.props.tutorials.map((t, i) =>
              <button key={t.id} type="button" className="list-group-item" onClick={this.onSelect(t.id)}>
                <h4>
                  {i + 1}. {t.label}
                </h4>
                <p>
                  {t.description}
                </p>
              </button>
            )}
          </div>
          <br />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default" onClick={this.props.onCancel}>
            <span>
              {_T("Cancel")}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
    );*/
  }
}
