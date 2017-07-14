import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";
import { CollapsiblePanelComponent } from "app/ui/_generic/collapsible-panel.component";
import {
  ActionConfirmationModalComponent,
  IDialogCallbackResult
} from "app/ui/_generic/action-confirmation-modal.component";
import { DateTimeStampComponent } from "app/ui/_generic/date-time-stamp.component";
import { ProgressIndicatorComponent } from "app/ui/_generic/progress-indicator.component";
import { NoDataComponent } from "app/ui/_generic/no-data.component";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import {
  ProgramsLocalStorageRepository,
  IProgramsRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramsSamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";

import "./gallery.component.scss";
import { ProgramStorageType } from "app/services/program/program-management.service";

interface IComponentState {
  userName: string;
  programs: ProgramModel[];
  samples: ProgramModel[];
  isLoading?: boolean;
  errorMessge?: string;
  programToDelete: ProgramModel | undefined;
}

interface IComponentProps extends RouteComponentProps<void> {}

export class GalleryComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(ICurrentUserService) private currentUser: ICurrentUserService;
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(ProgramsLocalStorageRepository) private programsRepo: IProgramsRepository;
  @lazyInject(ProgramsSamplesRepository) private samplesRepo: IProgramsRepository;

  readonly noScreenshot = require("./images/no.image.png") as string;

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      userName: this.currentUser.getLoginStatus().userInfo.attributes.name,
      programs: [],
      samples: [],
      programToDelete: undefined,
      isLoading: true
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Gallery"));
    await this.loadData();
  }

  async loadData() {
    this.setState({ isLoading: true });
    const programs = await this.programsRepo.getAll();
    const samples = await this.samplesRepo.getAll();
    this.setState({
      programs: programs,
      samples: samples,
      isLoading: false
    });
  }

  confirmDelete = async (): Promise<IDialogCallbackResult> => {
    if (this.state.programToDelete) {
      this.setState({ isLoading: true });
      await this.programsRepo.remove(this.state.programToDelete.id);
    }
    await this.loadData();
    this.setState({ programToDelete: undefined });
    return { isSuccess: true };
  };

  renderProgramCard(p: ProgramModel, storageType: ProgramStorageType, deleteBox: boolean): JSX.Element {
    const link = Routes.playgroundRoot.build({ programId: p.id, storageType: storageType });

    return (
      <div className="media">
        <div className="media-left">
          <Link to={link}>
            <img className="media-object" style={{ width: 133, height: 100 }} src={p.screenshot || this.noScreenshot} />
          </Link>
        </div>
        <div className="media-body">
          {deleteBox &&
            <div className="pull-right">
              <button
                type="button"
                className="btn btn-xs btn-link"
                onClick={() => {
                  this.setState({ programToDelete: p });
                }}
              >
                <span>
                  {_T("Delete")}
                </span>
              </button>
            </div>}
          <h4 className="media-heading ex-break-word">
            <span>&nbsp;</span>
            <Link to={link}>
              <span className="ex-break-word">
                {p.name || _T("Program")}
              </span>
            </Link>
          </h4>
          <br />
          <table className="table table-condensed">
            <tbody>
              {p.dateLastEdited.getTime() !== p.dateCreated.getTime() &&
                <tr>
                  <th style={{ width: "10%" }}>
                    {_T("Edited")}
                  </th>
                  <td style={{ width: "90%" }}>
                    {<DateTimeStampComponent datetime={p.dateLastEdited} />}
                  </td>
                </tr>}
              <tr>
                <th style={{ width: "10%" }}>
                  {_T("Created")}
                </th>
                <td style={{ width: "90%" }}>
                  {<DateTimeStampComponent datetime={p.dateCreated} />}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-scroll-outer">
          <div className="container-fluid ex-gallery-container">
            <PageHeaderComponent title={_T("Gallery")} />
            {this.state.programToDelete &&
              <ActionConfirmationModalComponent
                show
                onConfirm={this.confirmDelete}
                actionButtonText={_T("Delete")}
                cancelButtonText={_T("Cancel")}
                headerText={_T("Do you want to delete?")}
                onCancel={() => {
                  this.setState({ programToDelete: undefined });
                }}
              >
                <div>
                  <h3>
                    {_T("Delete program")}
                  </h3>
                  <br />
                  {this.renderProgramCard(this.state.programToDelete, "samples", false)}
                  <br />
                </div>
              </ActionConfirmationModalComponent>}
            <div className="row">
              <div className="col-sm-6">
                <CollapsiblePanelComponent collapsed={false} title={_T("Personal library")}>
                  <div>
                    {this.state.isLoading
                      ? <div>
                          <br />
                          <br />
                          <br />
                          <ProgressIndicatorComponent isLoading />
                          <br />
                          <br />
                          <br />
                        </div>
                      : this.state.programs.length > 0
                        ? this.state.programs.map((p, i) => {
                            return (
                              <div key={p.id}>
                                {i != 0 && <hr />}
                                {this.renderProgramCard(p, "gallery", true)}
                              </div>
                            );
                          })
                        : <NoDataComponent
                            noBorder
                            title={_T("Space for your personal programs")}
                            description={_T("NO_PROGRAMS_IN_PERSONAL_LIBRARY")}
                          />}
                  </div>
                </CollapsiblePanelComponent>
              </div>
              <div className="col-sm-6">
                <CollapsiblePanelComponent collapsed={false} title={_T("Samples")}>
                  <div>
                    {this.state.isLoading
                      ? <div>
                          <br />
                          <br />
                          <br />
                          <ProgressIndicatorComponent isLoading />
                          <br />
                          <br />
                          <br />
                        </div>
                      : this.state.samples.map((p, i) => {
                          return (
                            <div key={p.id}>
                              {i != 0 && <hr />}
                              {this.renderProgramCard(p, "samples", false)}
                            </div>
                          );
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
