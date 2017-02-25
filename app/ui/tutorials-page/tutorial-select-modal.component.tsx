import * as React from 'react';
import { Link } from 'react-router'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { Subject, BehaviorSubject } from 'rxjs'

import { ITutorialInfo, ITutorialStep } from 'app/services/tutorials-content-service';

interface IComponentState {
}

interface IComponentProps {
    tutorials: ITutorialInfo[]
    onSelect: (tutorialId: string) => void
    onCancel: () => void
}

export class TutorialSelectModalComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };
    }

    onSelect = (tutorialId: string) => {
        return () => {
            this.props.onSelect(tutorialId);
        }
    }

    render(): JSX.Element {
        return <Modal show={true} onHide={this.props.onCancel} animation={false} backdrop='static' >
            <Modal.Header closeButton>
                <Modal.Title>Choose a tutorial</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="list-group">
                    {
                        this.props.tutorials.map((t, i) => <button
                            key={t.id}
                            type="button"
                            className="list-group-item"
                            onClick={this.onSelect(t.id)}
                        >
                            <h4>{i + 1}. {t.name}</h4>
                            <p>{t.description}</p>
                        </button>)
                    }
                </div>
                <br />
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-default" onClick={this.props.onCancel}>
                    <span>Cancel</span>
                </button>
            </Modal.Footer>
        </Modal>
    }
}