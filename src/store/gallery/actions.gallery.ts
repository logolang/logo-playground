import { action, ActionType } from "typesafe-actions";
import { GallerySection } from "./state.gallery";
import { ProgramModel } from "services/program.model";

export enum GalleryActionType {
  LOAD_SECTION_STARTED = "LOAD_SECTION_STARTED",
  LOAD_SECTION_COMPLETED = "LOAD_SECTION_COMPLETED",
  TOGGLE_IMPORT_MODAL = "TOGGLE_IMPORT_MODAL",
  IMPORT_STARTED = "IMPORT_STARTED",
  IMPORT_COMPLETED = "IMPORT_COMPLETED"
}

export const galleryActionCreator = {
  loadSectionStarted: (section: GallerySection) =>
    action(GalleryActionType.LOAD_SECTION_STARTED, {
      section
    }),

  loadSectionCompleted: (section: GallerySection, programs: ProgramModel[]) =>
    action(GalleryActionType.LOAD_SECTION_COMPLETED, {
      section,
      programs
    }),

  toggleImportModal: (show: boolean) => action(GalleryActionType.TOGGLE_IMPORT_MODAL, { show }),

  importStarted: () => action(GalleryActionType.IMPORT_STARTED),
  importCompleted: (success: boolean, errorMessage?: string) =>
    action(GalleryActionType.IMPORT_COMPLETED, { success, errorMessage })
};

export type GalleryAction = ActionType<typeof galleryActionCreator>;
