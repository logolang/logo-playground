import { connect } from "react-redux";
import { AppState } from "store/store";
import { galleryActionCreator } from "store/gallery/actions.gallery";
import { Gallery } from "./gallery";

export const GalleryContainer = connect(
  (state: AppState) => ({
    activeSection: state.gallery.activeSection,
    programs: state.gallery.programs,
    isLoading: state.gallery.isLoading,
    user: state.env.user
  }),
  {
    selectSection: galleryActionCreator.loadSection,
    showImportModal: () => galleryActionCreator.toggleImportModal(true)
  }
)(Gallery);
