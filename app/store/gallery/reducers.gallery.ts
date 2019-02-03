import { GalleryState, defaultGalleryState } from "./state.gallery";
import { GalleryAction, GalleryActionType } from "./actions.gallery";

export function reducers(state: GalleryState | undefined, action: GalleryAction): GalleryState {
  if (!state || !action) {
    return defaultGalleryState;
  }
  switch (action.type) {
    case GalleryActionType.LOAD_SECTION_STARTED:
      return {
        ...state,
        isLoading: true,
        activeSection: action.payload.section
      };
    case GalleryActionType.LOAD_SECTION_COMPLETED:
      if (action.payload.section === state.activeSection) {
        return {
          ...state,
          isLoading: false,
          programs: action.payload.programs
        };
      }
      return state;
    case GalleryActionType.TOGGLE_IMPORT_MODAL:
      return {
        ...state,
        showImportModal: action.payload.show
      };
    case GalleryActionType.IMPORT_STARTED:
      return {
        ...state,
        importErrorMessage: "",
        isImportInProgress: true
      };
    case GalleryActionType.IMPORT_COMPLETED:
      return {
        ...state,
        showImportModal: !action.payload.success,
        importErrorMessage: action.payload.errorMessage,
        isImportInProgress: false
      };
    default:
      return state;
  }
}
