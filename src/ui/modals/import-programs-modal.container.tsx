import { connect } from "react-redux";
import { AppState } from "store/store";
import { ImportProgramsModal } from "./import-programs-modal";
import { galleryActionCreator } from "store/gallery/actions.gallery";

export const ImportProgramsContainerContainer = connect(
  (state: AppState) => ({
    showImportModal: state.gallery.showImportModal,
    importErrorMessage: state.gallery.importErrorMessage,
    isImportInProgress: state.gallery.isImportInProgress
  }),
  {
    onImport: galleryActionCreator.import,
    onClose: () => galleryActionCreator.toggleImportModal(false)
  }
)(ImportProgramsModal);
