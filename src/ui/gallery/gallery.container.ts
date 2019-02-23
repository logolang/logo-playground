import { connect } from "react-redux";
import { AppState } from "store/store";
import { Gallery } from "./gallery";
import { galleryActionCreator } from "store/gallery/actions.gallery";
import { galleryThunks } from "store/gallery/thunks.gallery";

export const GalleryContainer = connect(
  (state: AppState) => ({
    activeSection: state.gallery.activeSection,
    programs: state.gallery.programs,
    isLoading: state.gallery.isLoading,
    user: state.env.user
  }),
  {
    selectSection: galleryThunks.loadSection,
    showImportModal: () => galleryActionCreator.toggleImportModal(true)
  }
)(Gallery);
