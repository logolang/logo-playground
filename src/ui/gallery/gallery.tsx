import * as React from "react";
import * as cn from "classnames";
import { Link } from "react-router-dom";
import * as FileSaver from "file-saver";

import { ensure } from "utils/syntax";
import { resolve } from "utils/di";
import { $T } from "i18n-strings";
import { Routes } from "ui/routes";
import { ProgramModel } from "services/program.model";
import { GallerySection } from "store/gallery/state.gallery";
import { UserData } from "services/infrastructure/auth-service";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";
import { ProgramsHtmlSerializer } from "services/programs-html-serializer";

import { NoData } from "ui/_generic/no-data";
import { TileGrid } from "ui/_generic/tile-grid";
import { Loading } from "ui/_generic/loading";
import { InfoBox } from "ui/_generic/info-box";
import { MainMenuContainer } from "ui/main-menu.container";
import { ImportProgramsModalContainer } from "ui/modals/import-programs-modal.container";

import "./gallery.less";

interface State {}

interface Props {
  activeSection: GallerySection;
  user: UserData;
  programs: ProgramModel[];
  isLoading: boolean;
  selectSection(section: GallerySection, options?: { forceLoad: boolean }): void;
  showImportModal(): void;
}

export class Gallery extends React.Component<Props, State> {
  private eventsTracker = resolve(EventsTrackingService);

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    this.eventsTracker.sendEvent(EventAction.openGallery);
    this.props.selectSection(this.props.activeSection, { forceLoad: true });
  }

  handleExportClick = async () => {
    const html = await new ProgramsHtmlSerializer(window).serialize(
      this.props.programs,
      this.props.user.name,
      this.props.user.imageUrl
    );
    const blob = new Blob([html], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `my-logo-programs.html`);
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container gallery-component">
        <MainMenuContainer />
        <div className="ex-page-content is-fullscreen">
          <div className="container">
            <br />
            {this.renderTabs()}
            {this.props.isLoading ? (
              <Loading fullPage isLoading />
            ) : (
              <>
                {this.props.activeSection === GallerySection.PersonalLibrary && (
                  <>
                    <div className="field is-grouped export-import-buttons-group">
                      <p className="control">
                        <button
                          type="button"
                          className="button"
                          onClick={this.props.showImportModal}
                        >
                          {$T.gallery.import}
                        </button>
                      </p>
                      {this.props.programs.length > 0 && (
                        <p className="control">
                          <button type="button" className="button" onClick={this.handleExportClick}>
                            {$T.gallery.export}
                          </button>
                        </p>
                      )}
                      <ImportProgramsModalContainer />
                    </div>
                  </>
                )}

                {this.props.programs.length > 0 ? (
                  <>
                    <TileGrid
                      tileWidth={250}
                      tileWidthMobile={170}
                      tiles={this.props.programs.map(pr => this.renderProgramCard(pr))}
                    />
                    <br />
                    {this.props.activeSection === GallerySection.PersonalLibrary &&
                      !this.props.user.isLoggedIn && (
                        <div className="gallery-message-box">
                          <InfoBox
                            content={
                              <article>
                                <p>{$T.gallery.notLoggedInGalleryMessage}</p>
                                <p>
                                  <Link to={Routes.loginPage.build({})}>Sign in</Link>
                                </p>
                              </article>
                            }
                          />
                        </div>
                      )}
                  </>
                ) : (
                  this.props.activeSection === GallerySection.PersonalLibrary && (
                    <NoData title="" description={$T.gallery.emptyLibrary} />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderTabs() {
    return (
      <div className="tabs is-centered is-boxed">
        <ul>
          <li
            className={cn({
              "is-active": this.props.activeSection === GallerySection.ExamplesAdvanced
            })}
          >
            <a onClick={() => this.props.selectSection(GallerySection.ExamplesAdvanced)}>
              <i className="fas fa-flask" />
              &nbsp;<span>{$T.gallery.examples}</span>
            </a>
          </li>
          <li
            className={cn({
              "is-active": this.props.activeSection === GallerySection.ExamplesBasic
            })}
          >
            <a onClick={() => this.props.selectSection(GallerySection.ExamplesBasic)}>
              <i className="fa fa-puzzle-piece" />
              &nbsp;<span>{$T.gallery.shapes}</span>
            </a>
          </li>
          <li
            className={cn({
              "is-active": this.props.activeSection === GallerySection.PersonalLibrary
            })}
          >
            <a onClick={() => this.props.selectSection(GallerySection.PersonalLibrary)}>
              <i className="fas fa-images" />
              &nbsp;
              <span>{$T.gallery.library}</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  renderProgramCard(p: ProgramModel): JSX.Element {
    const link = Routes.playground.build({ storageType: ensure(p.storageType), id: p.id });
    return (
      <div className="card program-card">
        <div className="card-image">
          {p.screenshot ? (
            <figure className="image is-4by3 gallery-img-container">
              <Link to={link}>
                <img src={p.screenshot} />
                <div className="gallery-img-title">{p.name}</div>
              </Link>
            </figure>
          ) : (
            <NoData iconClass="fa-picture-o" title={$T.gallery.noImage} />
          )}
        </div>
      </div>
    );
  }
}
