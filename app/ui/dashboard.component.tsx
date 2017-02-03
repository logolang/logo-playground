import * as React from 'react';
import { Link } from 'react-router'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { CollapsiblePanelComponent } from './shared/generic/collapsible-panel.component';

import { ServiceLocator } from 'app/services/service-locator'
import { Program } from '../services/entities/programs-localstorage.repository';
import { Routes } from '../routes';

interface IDashboardComponentState {
    userName: string;
    programs: Program[];
}

interface IDashboardComponentProps {
}

export class DashboardComponent extends React.Component<IDashboardComponentProps, IDashboardComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);

    constructor(props: IDashboardComponentProps) {
        super(props);

        this.state = {
            userName: this.currentUser.getLoginStatus().userInfo.attributes.name,
            programs: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const programs = await this.programsRepo.getAll();
        this.setState({ programs: programs });
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <PageHeaderComponent title={`Welcome, ${this.state.userName}`} />
                <div className="row">
                    <div className="col-sm-12">
                        <CollapsiblePanelComponent collapsed={false} title="Personal Library ">
                            <div>
                                {this.state.programs.map((p, i) => {
                                    return <div key={p.id}>
                                        {(i != 0) && <hr />}
                                        <h4>
                                            <Link to={Routes.playgroundLibrary({ programId: p.id })}>
                                                <span>{p.name}</span>
                                            </Link>
                                        </h4>
                                        <p><label>Created: </label> {p.dateCreated}</p>
                                    </div>
                                })}
                            </div>
                        </CollapsiblePanelComponent>
                    </div>
                </div>
            </div>
        );
    }
}