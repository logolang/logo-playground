import * as React from 'react';
import { Link } from 'react-router'
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { CollapsiblePanelComponent } from './shared/generic/collapsible-panel.component';
import { ActionConfirmationModalComponent } from './shared/generic/action-confirmation-modal.component';

import { ServiceLocator } from 'app/services/service-locator'
import { Program } from '../services/entities/programs-localstorage.repository';
import { Routes } from '../routes';

interface IDashboardComponentState {
    userName: string;
    programs: Program[];

    programToDelete: Program | undefined;
}

interface IDashboardComponentProps {
}

export class DashboardComponent extends React.Component<IDashboardComponentProps, IDashboardComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    readonly noScreenshot = require('./images/no.image.600x300.png') as string;

    constructor(props: IDashboardComponentProps) {
        super(props);

        this.state = {
            userName: this.currentUser.getLoginStatus().userInfo.attributes.name,
            programs: [],
            programToDelete: undefined
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const programs = await this.programsRepo.getAll();
        this.setState({ programs: programs });
    }

    confirmDelete = async (): Promise<string> => {
        if (this.state.programToDelete) {
            await this.programsRepo.remove(this.state.programToDelete.id);
        }
        await this.loadData();
        this.setState({ programToDelete: undefined });
        return '';
    }

    renderProgramCard(p: Program, deleteBox: boolean): JSX.Element {
        return <div className="media">
            <div className="media-left">
                <a href="#">
                    <img className="media-object"
                        style={{ width: 133, height: 100 }}
                        src={p.screenshot || this.noScreenshot} />
                </a>
            </div>
            <div className="media-body">
                <h4 className="media-heading">
                    <Link to={Routes.playgroundLibrary({ programId: p.id })}>
                        <span>{p.name}</span>
                    </Link>
                </h4>
                <p><label>Created: </label> {p.dateCreated}</p>
            </div>
            {
                deleteBox && <div className="media-right">
                    <button type="button" className="btn btn-xs btn-link"
                        onClick={() => { this.setState({ programToDelete: p }) }}
                    >
                        <span>Delete</span>
                    </button>
                </div>
            }
        </div>
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <PageHeaderComponent title={`Welcome, ${this.state.userName}`} />
                <div className="row">
                    <div className="col-sm-12">
                        {
                            this.state.programToDelete && <ActionConfirmationModalComponent
                                onConfirm={this.confirmDelete}
                                actionButtonText="Delete"
                                headerText="Do you want to delete?"
                                onCancel={() => { this.setState({ programToDelete: undefined }) }}
                            >
                                <div>
                                    <h3>Delete program</h3>
                                    <br />
                                    {this.renderProgramCard(this.state.programToDelete, false)}
                                    <br />
                                </div>
                            </ActionConfirmationModalComponent>
                        }

                        <CollapsiblePanelComponent collapsed={false} title="Personal Library ">
                            <div>
                                {this.state.programs.map((p, i) => {
                                    return <div key={p.id}>
                                        {(i != 0) && <hr />}
                                        {this.renderProgramCard(p, true)}
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