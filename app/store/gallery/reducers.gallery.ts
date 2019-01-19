import { GalleryState, GallerySection } from "./state.gallery";
import { GalleryAction, GalleryActionType } from "./actions.gallery";

export function reducers(state: GalleryState | undefined, action: GalleryAction): GalleryState {
  if (!state) {
    return null as any; // This effectively skips initial state because that is defined in the store initialization
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
    default:
      return state;
  }
}