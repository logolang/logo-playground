import * as React from 'react';
import * as cn from 'classnames';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Tab, Row, Col, Collapse } from 'react-bootstrap';

import { alterState } from 'app/utils/react-helpers';

interface ICollapsiblePanelState {
    collapsed: boolean
}

interface ICollapsiblePanelProps {
    title: string
    collapsed: boolean
    bsStyle?: string
}

export class CollapsiblePanelComponent extends React.Component<ICollapsiblePanelProps, ICollapsiblePanelState> {
    constructor(props: ICollapsiblePanelProps) {
        super(props);

        this.state = {
            collapsed: this.props.collapsed
        }
    }

    render(): JSX.Element {
        return (
            <div className={`panel panel-${this.props.bsStyle || 'default'}`}>
                <div className="panel-heading"
                    onClick={alterState(this, x => x.collapsed = !x.collapsed)}
                    >
                    <span>{this.props.title}</span>
                    <span className="ex-spacer-small" />
                    <small><span className={cn("glyphicon",
                        {
                            "glyphicon-menu-down": this.state.collapsed,
                            "glyphicon-menu-up": !this.state.collapsed
                        })}></span></small>
                </div>
                <Collapse in={!this.state.collapsed}>
                    <div>
                        <div className="panel-body">
                            {this.props.children}
                        </div>
                    </div>
                </Collapse>
            </div>
        );
    }
}