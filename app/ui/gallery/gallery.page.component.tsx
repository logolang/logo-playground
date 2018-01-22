import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";
import { ModalComponent, IDialogCallbackResult } from "app/ui/_generic/modal.component";
import { DateTimeStampComponent } from "app/ui/_generic/date-time-stamp.component";
import { NoDataComponent } from "app/ui/_generic/no-data.component";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import {
  ProgramsLocalStorageRepository,
  IUserLibraryRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModel } from "app/services/program/program.model";
import { GallerySamplesRepository, IGallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramStorageType } from "app/services/program/program-management.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { createCompareFuntion } from "app/utils/syntax-helpers";

import "./gallery.page.component.scss";

interface IComponentState {
  userName: string;
  programs: ProgramModel[];
  samples: ProgramModel[];
  isLoading?: boolean;
  errorMessge?: string;
  programToDelete: ProgramModel | undefined;
}

interface IComponentProps extends RouteComponentProps<void> {}

export class GalleryPageComponent extends React.Component<IComponentProps, IComponentState> {
  private currentUser = resolveInject(ICurrentUserService);
  private titleService = resolveInject(TitleService);
  private programsRepo = resolveInject(IUserLibraryRepository);
  private samplesRepo = resolveInject(IGallerySamplesRepository);
  private eventsTracker = resolveInject(IEventsTrackingService);

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
    this.eventsTracker.sendEvent(EventAction.openGallery);
    await this.loadData();
  }

  async loadData() {
    const sortingFunction = createCompareFuntion<ProgramModel>(x => x.dateLastEdited, "desc");
    const samples = await this.samplesRepo.getAll();
    samples.sort(sortingFunction);
    this.setState({
      samples: samples
    });

    this.setState({ isLoading: true });
    const programs = await this.programsRepo.getAll();
    programs.sort(sortingFunction);
    this.setState({
      programs,
      isLoading: false
    });
  }

  confirmDelete = async (): Promise<void> => {
    if (this.state.programToDelete) {
      this.setState({ isLoading: true });
      await this.programsRepo.remove(this.state.programToDelete.id);
      this.eventsTracker.sendEvent(EventAction.deleteProgramFromPersonalLibrary);
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

            <p className="subtitle">{_T("Your personal library")}</p>
            <LoadingComponent isLoading={this.state.isLoading} />
            {this.state.programs.length > 0 && (
              <div className="program-cards-container">
                {this.state.programs.map(pr => this.renderProgramCard(pr, ProgramStorageType.gallery, true))}
              </div>
            )}
            <br />

            <p className="subtitle">{_T("Samples")}</p>
            <div className="program-cards-container">
              {this.state.samples.map(pr => this.renderProgramCard(pr, ProgramStorageType.samples, false))}
            </div>

            {this.renderDeleteModal()}
          </div>
        </div>
      </div>
    );
  }

  renderProgramCard(p: ProgramModel, storageType: ProgramStorageType, deleteBox: boolean): JSX.Element {
    const link =
      storageType === ProgramStorageType.gallery
        ? Routes.codeLibrary.build({ id: p.id })
        : Routes.codeExample.build({ id: p.id });
    return (
      <div key={p.id} className="card program-card">
        <div className="card-image">
          {p.screenshot ? (
            <figure className="image is-4by3">
              <Link to={link}>
                <img src={p.screenshot} />
              </Link>
            </figure>
          ) : (
            <NoDataComponent iconClass="fa-picture-o" title={_T("No image")} />
          )}
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
              {deleteBox && (
                <a
                  onClick={() => {
                    this.setState({ programToDelete: p });
                  }}
                >
                  {_T("Delete")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderDeleteModal() {
    const p = this.state.programToDelete;

    return (
      p && (
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
          <AlertMessageComponent title={_T("You are going to delete this program.")} type="warning" />
          <br />
          <div className="card">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  {p.screenshot ? (
                    <figure className="image is-128x128">
                      <img src={p.screenshot} />
                    </figure>
                  ) : (
                    <NoDataComponent iconClass="fa-picture-o" title={_T("No image")} />
                  )}
                </div>
                <div className="media-content">
                  <p className="subtitle is-4">{p.name}</p>
                  <p className="is-6">
                    <strong>{_T("Edited")}: </strong>
                    <DateTimeStampComponent datetime={p.dateLastEdited} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalComponent>
      )
    );
  }
}
