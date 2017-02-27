import * as React from 'react';
import { Link } from 'react-router';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import * as moment from 'moment';

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { CollapsiblePanelComponent } from './shared/generic/collapsible-panel.component';
import { ActionConfirmationModalComponent } from './shared/generic/action-confirmation-modal.component';

import { ServiceLocator } from 'app/services/service-locator'
import { ProgramsSamplesRepository } from '../services/entities/programs-samples.repository';
import { Program, ProgramStorageType } from '../services/entities/programs-localstorage.repository';
import { Routes } from '../routes';

interface IDashboardComponentState {
    userName: string;
    programs: Program[];
    samples: Program[];

    programToDelete: Program | undefined;
}

interface IDashboardComponentProps {
}

export class DashboardComponent extends React.Component<IDashboardComponentProps, IDashboardComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    private samplesRepo = new ProgramsSamplesRepository();
    readonly noScreenshot = require('./images/no.image.png') as string;
    readonly yesterdayDate = moment().subtract(1, 'd');

    constructor(props: IDashboardComponentProps) {
        super(props);

        this.state = {
            userName: this.currentUser.getLoginStatus().userInfo.attributes.name,
            programs: [],
            samples: [],
            programToDelete: undefined
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const programs = await this.programsRepo.getAll();
        const samples = await this.samplesRepo.getAll();
        this.setState({
            programs: programs,
            samples: samples
        });
    }

    confirmDelete = async (): Promise<string> => {
        if (this.state.programToDelete) {
            await this.programsRepo.remove(this.state.programToDelete.id);
        }
        await this.loadData();
        this.setState({ programToDelete: undefined });
        return '';
    }

    private formatDate(date: Date) {
        const momDate = moment(date);
        const formattedDate = momDate.isAfter(this.yesterdayDate)
            ? momDate.fromNow()
            : momDate.calendar();
        return formattedDate;
    }

    renderProgramCard(p: Program, storageType: ProgramStorageType, deleteBox: boolean): JSX.Element {
        let link = '';
        switch (storageType) {
            case 'library':
                link = Routes.playgroundLoadFromLibrary.buildWithParams({ programId: p.id });
                break;
            case 'samples':
                link = Routes.playgroundLoadSample.buildWithParams({ sampleId: p.id });
                break;
            case 'gist':
                link = Routes.playgroundLoadFromGist.buildWithParams({ gistId: p.id });
                break;
        }

        return <div className="media">
            <div className="media-left">
                <Link to={link}>
                    <img className="media-object"
                        style={{ width: 133, height: 100 }}
                        src={p.screenshot || this.noScreenshot} />
                </Link>
            </div>
            <div className="media-body">
                {
                    deleteBox && <div className="pull-right">
                        <button type="button" className="btn btn-xs btn-link"
                            onClick={() => { this.setState({ programToDelete: p }) }}
                        >
                            <span>Delete</span>
                        </button>
                    </div>
                }
                <h4 className="media-heading ex-break-word">
                    <span>&nbsp;</span>
                    <Link to={link}>
                        <span className="ex-break-word">{p.name || 'Program'}</span>
                    </Link>
                </h4>
                <br />
                <table className="table table-condensed">
                    <tbody>
                        {
                            p.dateLastEdited.getTime() !== p.dateCreated.getTime() &&
                            <tr>
                                <th style={{ width: '10%' }}>Edited</th>
                                <td style={{ width: '90%' }}>{this.formatDate(p.dateLastEdited)}</td>
                            </tr>
                        }
                        <tr>
                            <th style={{ width: '10%' }}>Created</th>
                            <td style={{ width: '90%' }}>{this.formatDate(p.dateCreated)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    }

    render(): JSX.Element {
        return (
            <div className="ex-page-container">
                <MainMenuComponent />
                <div className="ex-scroll-outer">
                    <div className="container-fluid">
                        <PageHeaderComponent title={`Gallery`} />
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
                                    {this.renderProgramCard(this.state.programToDelete, 'library', false)}
                                    <br />
                                </div>
                            </ActionConfirmationModalComponent>
                        }
                        <div className="row">
                            <div className="col-sm-6">
                                <CollapsiblePanelComponent collapsed={false} title="Personal Library ">
                                    <div>
                                        {this.state.programs.map((p, i) => {
                                            return <div key={p.id}>
                                                {(i != 0) && <hr />}
                                                {this.renderProgramCard(p, 'library', true)}
                                            </div>
                                        })}
                                    </div>
                                </CollapsiblePanelComponent>
                            </div>
                            <div className="col-sm-6">
                                <CollapsiblePanelComponent collapsed={false} title="Samples ">
                                    <div>
                                        {this.state.samples.map((p, i) => {
                                            return <div key={p.id}>
                                                {(i != 0) && <hr />}
                                                {this.renderProgramCard(p, 'samples', false)}
                                            </div>
                                        })}
                                    </div>
                                </CollapsiblePanelComponent>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}