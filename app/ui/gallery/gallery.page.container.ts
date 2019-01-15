import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { galleryActionCreator } from "app/store/gallery/actions.gallery";
import { GalleryPageComponent } from "./gallery.page.component";

export const GalleryPageContainer = connect(
  (state: AppState) => ({
    activeSection: state.gallery.activeSection,
    isUserLoggedIn: true,
    programs: state.gallery.programs,
    isLoading: state.gallery.isLoading
  }),
  {
    selectSection: galleryActionCreator.loadSection
  }
)(GalleryPageComponent);
