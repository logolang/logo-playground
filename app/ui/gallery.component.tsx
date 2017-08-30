import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";
import { CollapsiblePanelComponent } from "app/ui/_generic/collapsible-panel.component";
import { ModalComponent, IDialogCallbackResult } from "app/ui/_generic/action-confirmation-modal.component";
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

  confirmDelete = async (): Promise<void> => {
    if (this.state.programToDelete) {
      this.setState({ isLoading: true });
      await this.programsRepo.remove(this.state.programToDelete.id);
    }
    await this.loadData();
    this.setState({ programToDelete: undefined });
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container gallery-component">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <PageHeaderComponent title={_T("Gallery")} />
            <br />

            {this.state.programToDelete && (
              <ModalComponent
                show
                onConfirm={this.confirmDelete}
                actionButtonText={_T("Delete")}
                cancelButtonText={_T("Cancel")}
                title={_T("Do you want to delete?")}
                onCancel={() => {
                  this.setState({ programToDelete: undefined });
                }}
              >
                <div>
                  <h3>{_T("Delete program")}</h3>
                  <br />
                  {this.renderProgramCard(this.state.programToDelete, "samples", false)}
                  <br />
                </div>
              </ModalComponent>
            )}

            {this.state.programs.length > 0 && (
              <div>
                <p className="subtitle">Your personal library</p>
                <div className="program-cards-container">
                  {this.state.programs.map(pr => this.renderProgramCard(pr, "gallery", true))}
                </div>
              </div>
            )}
            <p className="subtitle">Samples</p>
            <div className="program-cards-container">
              {this.state.samples.map(pr => this.renderProgramCard(pr, "samples", false))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderProgramCard(p: ProgramModel, storageType: ProgramStorageType, deleteBox: boolean): JSX.Element {
    const link = Routes.playgroundRoot.build({ programId: p.id, storageType: storageType });
    return (
      <div key={p.id} className="card program-card">
        <div className="card-image">
          <figure className="image is-4by3">
            <Link to={link}>
              <img src={p.screenshot || this.noScreenshot} />
            </Link>
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content">
              <p className="title is-4">
                <Link to={link}>{p.name}</Link>
              </p>
              <p className="subtitle is-6">
                <DateTimeStampComponent datetime={p.dateLastEdited} />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
