import * as React from 'react';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ServiceLocator } from 'app/services/service-locator'

import { Routes } from 'app/routes';
import './main-playground-menu.component.scss'

interface IComponentState {
    isVisible: boolean
}

interface IComponentProps {
}

export class MainPlaygroundMenuComponent extends React.Component<IComponentProps, IComponentState> {
    private playgroundEvents = ServiceLocator.resolve(x => x.playgroundEvents);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isVisible: false
        }
    }

    componentDidMount() {
        this.playgroundEvents.subscribeToIsActive((active) => {
            this.setState({ isVisible: active });
        })
    }

    runClick = () => {
        this.playgroundEvents.run();
    }

    render(): JSX.Element | null {
        if (!this.state.isVisible) {
            return null;
        }

        return <Nav className="main-playground-menu">
            <NavItem onClick={this.runClick}><span className="glyphicon glyphicon-play" aria-hidden="true"></span><span> Run</span></NavItem>
            {/*
                        <NavItem><span className="glyphicon glyphicon-stop" aria-hidden="true"></span><span> Stop</span></NavItem>
                        */}
            <NavDropdown id="main-playground-menu-options-dropdown" bsClass="dropdown" noCaret
                title={
                    <span className="glyphicon glyphicon-option-vertical" aria-hidden="true"></span> as any
                }>
                <MenuItem>New Program</MenuItem>
                <MenuItem>Make a copy...</MenuItem>
                <MenuItem>Share</MenuItem>
            </NavDropdown>
        </Nav>
    }
}