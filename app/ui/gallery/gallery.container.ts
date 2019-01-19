import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { galleryActionCreator } from "app/store/gallery/actions.gallery";
import { Gallery } from "./gallery";

export const GalleryContainer = connect(
  (state: AppState) => ({
    activeSection: state.gallery.activeSection,
    //TODO
    isUserLoggedIn: true,
    programs: state.gallery.programs,
    isLoading: state.gallery.isLoading
  }),
  {
    selectSection: galleryActionCreator.loadSection
  }
)(Gallery);
