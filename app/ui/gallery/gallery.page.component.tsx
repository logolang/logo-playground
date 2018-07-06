import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { createCompareFunction } from "app/utils/syntax-helpers";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { $T } from "app/i18n/strings";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { ProgramModel } from "app/services/program/program.model";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { ProgramStorageType, ProgramManagementService } from "app/services/program/program-management.service";
import { CurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { NoDataComponent } from "app/ui/_generic/no-data.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import "./gallery.page.component.less";

interface IComponentState {
  userName: string;
  programs?: ProgramModel[];
  samples?: ProgramModel[];
  isLoading?: boolean;
  isSyncronizing?: boolean;
  errorMessge?: string;
  programToDelete: ProgramModel | undefined;
}

interface IComponentProps extends RouteComponentProps<void> {}

export class GalleryPageComponent extends React.Component<IComponentProps, IComponentState> {
  private currentUser = resolveInject(CurrentUserService);
  private titleService = resolveInject(TitleService);
  private galleryService = resolveInject(PersonalGalleryService);
  private samplesRepo = resolveInject(GallerySamplesRepository);
  private eventsTracker = resolveInject(EventsTrackingService);
  private programManagementService = resolveInject(ProgramManagementService);

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      userName: this.currentUser.getLoginStatus().userInfo.attributes.name,
      programToDelete: undefined,
      isLoading: true,
      isSyncronizing: true
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.gallery.galleryTitle);
    this.eventsTracker.sendEvent(EventAction.openGallery);
    await this.loadData();
  }

  async loadData() {
    const sortingFunction = createCompareFunction<ProgramModel>([
      { sortBy: x => x.hasTempLocalModifications, direction: "desc" },
      { sortBy: x => x.dateLastEdited, direction: "desc" },
      { sortBy: x => x.name }
    ]);

    const samples = await this.samplesRepo.getAll();
    this.programManagementService.initLocalModificationsFlag(samples);
    samples.sort(sortingFunction);

    const programs = await this.galleryService.getAllLocal();
    if (programs) {
      this.programManagementService.initLocalModificationsFlag(programs);
      programs.sort(sortingFunction);

      this.setState({
        samples,
        programs,
        isLoading: false
      });
    }

    const programsFromRemote = await this.galleryService.getAll();
    if (programsFromRemote) {
      this.programManagementService.initLocalModificationsFlag(programsFromRemote);
      programsFromRemote.sort(sortingFunction);
    }

    this.setState({
      samples,
      programs: programsFromRemote,
      isLoading: false,
      isSyncronizing: false
    });
  }

  confirmDelete = async (): Promise<void> => {
    if (this.state.programToDelete) {
      await this.galleryService.remove(this.state.programToDelete.id);
      this.eventsTracker.sendEvent(EventAction.deleteProgramFromPersonalLibrary);
      this.setState({ programToDelete: undefined, isSyncronizing: true });
    }
    await this.loadData();
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container gallery-component">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            {this.state.isLoading ? (
              <LoadingComponent fullPage isLoading />
            ) : (
              <>
                <br />
                <h1 className="title is-4">
                  {$T.gallery.personalLibrary}
                  {this.state.isSyncronizing && (
                    <>
                      &nbsp;&nbsp;<i
                        className="fa fa-refresh fa-spin has-text-grey-lighter"
                        title={$T.gallery.syncronizing}
                      />
                    </>
                  )}
                </h1>
                {this.state.programs && this.state.programs.length > 0 ? (
                  <div className="program-cards-container">
                    {this.state.programs.map(pr => this.renderProgramCard(pr, ProgramStorageType.gallery, true))}
                  </div>
                ) : (
                  <>
                    <NoDataComponent title="" description={$T.gallery.emptyLibrary} />
                  </>
                )}

                <br />
                <br />

                {this.state.samples &&
                  this.state.samples.length > 0 && (
                    <>
                      <h1 className="title is-4">{$T.gallery.examplesGallery}</h1>
                      <div className="program-cards-container">
                        {this.state.samples.map(pr => this.renderProgramCard(pr, ProgramStorageType.samples, false))}
                      </div>
                    </>
                  )}
              </>
            )}
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
            <figure className="image is-4by3 gallery-img-container">
              <Link to={link}>
                <img src={p.screenshot} />

                <div className="gallery-img-title">
                  {p.hasTempLocalModifications && (
                    <>
                      <i className="fa fa-asterisk icon-sm" aria-hidden="true" title={$T.program.programHasChanges} />
                      &nbsp;
                    </>
                  )}
                  {p.name}
                </div>
              </Link>
            </figure>
          ) : (
            <NoDataComponent iconClass="fa-picture-o" title={$T.gallery.noImage} />
          )}
        </div>
      </div>
    );
  }
}
