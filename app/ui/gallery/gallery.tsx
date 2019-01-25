import * as React from "react";
import * as cn from "classnames";
import { Link } from "react-router-dom";

import { ensure } from "app/utils/syntax";
import { resolveInject } from "app/di";
import { $T } from "app/i18n-strings";
import { Routes } from "app/routes";
import { ProgramModel } from "app/services/program/program.model";
import { GallerySection } from "app/store/gallery/state.gallery";
import { EventsTrackingService, EventAction } from "app/services/env/events-tracking.service";

import { NoData } from "app/ui/_generic/no-data";
import { Loading } from "app/ui/_generic/loading";
import { MainMenuContainer } from "../main-menu.container";

import "./gallery.less";

interface Props {
  activeSection: GallerySection;
  isUserLoggedIn: boolean;
  programs: ProgramModel[];
  isLoading: boolean;
  selectSection(section: GallerySection, options?: { forceLoad: boolean }): void;
}

export class Gallery extends React.Component<Props, {}> {
  private eventsTracker = resolveInject(EventsTrackingService);

  async componentDidMount() {
    this.eventsTracker.sendEvent(EventAction.openGallery);
    this.props.selectSection(this.props.activeSection, { forceLoad: true });
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container gallery-component">
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <br />
            {this.renderTabs()}
            {this.props.isLoading ? (
              <Loading fullPage isLoading />
            ) : (
              <>
                {this.props.programs.length > 0 ? (
                  <div className="program-cards-container">
                    {this.props.programs.map(pr => this.renderProgramCard(pr))}
                  </div>
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
              &nbsp;<span>Examples</span>
            </a>
          </li>
          <li
            className={cn({
              "is-active": this.props.activeSection === GallerySection.ExamplesBasic
            })}
          >
            <a onClick={() => this.props.selectSection(GallerySection.ExamplesBasic)}>
              <i className="fa fa-puzzle-piece" />
              &nbsp;<span>Shapes</span>
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
              <span>Library</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  renderProgramCard(p: ProgramModel): JSX.Element {
    const link = Routes.playground.build({ storageType: ensure(p.storageType), id: p.id });
    return (
      <div key={p.id} className="card program-card">
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
