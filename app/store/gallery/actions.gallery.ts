import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { createCompareFunction } from "app/utils/syntax";
import { normalizeError } from "app/utils/error";
import { resolve } from "app/di";
import { GallerySection } from "./state.gallery";
import { GetState } from "app/store/store";
import { envActionCreator } from "app/store/env/actions.env";
import { NotificationType } from "app/store/env/state.env";
import { ProgramModel } from "app/services/program/program.model";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { PersonalGalleryImportService } from "app/services/gallery/personal-gallery-import.service";
import { $T } from "app/i18n-strings";

export enum GalleryActionType {
  LOAD_SECTION_STARTED = "LOAD_SECTION_STARTED",
  LOAD_SECTION_COMPLETED = "LOAD_SECTION_COMPLETED",
  TOGGLE_IMPORT_MODAL = "TOGGLE_IMPORT_MODAL",
  IMPORT_STARTED = "IMPORT_STARTED",
  IMPORT_COMPLETED = "IMPORT_COMPLETED"
}

export const galleryActionCreator = {
  loadSection: loadSectionThunk,

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

  import: importThunk,
  importStarted: () => action(GalleryActionType.IMPORT_STARTED),
  importCompleted: (success: boolean, errorMessage?: string) =>
    action(GalleryActionType.IMPORT_COMPLETED, { success, errorMessage })
};

export type GalleryAction = ActionType<typeof galleryActionCreator>;

function loadSectionThunk(section: GallerySection, options?: { forceLoad?: boolean }) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().gallery;
    if (
      state.activeSection === section &&
      state.programs.length > 0 &&
      !(options && options.forceLoad)
    ) {
      return;
    }
    dispatch(galleryActionCreator.loadSectionStarted(section));

    const sortingFunction = createCompareFunction<ProgramModel>([
      { sortBy: x => x.dateLastEdited, direction: "desc" },
      { sortBy: x => x.name }
    ]);

    const samplesRepo = resolve(GallerySamplesRepository);
    const galleryService = resolve(PersonalGalleryService);

    try {
      switch (section) {
        case GallerySection.ExamplesAdvanced:
          {
            const samples = await samplesRepo.getAll("samples");
            samples.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, samples));
          }
          break;
        case GallerySection.ExamplesBasic:
          {
            const samples = await samplesRepo.getAll("shapes");
            samples.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, samples));
          }
          break;
        case GallerySection.PersonalLibrary:
          const programsFromLocal = galleryService.getAllLocal();
          if (programsFromLocal.length > 0) {
            programsFromLocal.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, programsFromLocal));
          }

          const programsFromRemote = await galleryService.getAll();
          programsFromRemote.sort(sortingFunction);
          dispatch(galleryActionCreator.loadSectionCompleted(section, programsFromRemote));
      }
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      dispatch(galleryActionCreator.loadSectionCompleted(section, []));
    }
  };
}

function importThunk(programsHtml: string) {
  return async (dispatch: Dispatch<any>, getState: GetState) => {
    dispatch(galleryActionCreator.importStarted());
    try {
      const importService = resolve(PersonalGalleryImportService);
      const count = await importService.import(programsHtml);
      dispatch(galleryActionCreator.importCompleted(true));
      dispatch(
        envActionCreator.showNotificationAutoClose(
          NotificationType.info,
          $T.gallery.importCompletedTitle,
          $T.gallery.addedProgramsMessage.val(count)
        )
      );
      dispatch(
        galleryActionCreator.loadSection(GallerySection.PersonalLibrary, { forceLoad: true })
      );
    } catch (e) {
      const ex = await normalizeError(e);
      dispatch(galleryActionCreator.importCompleted(false, ex.message));
    }
  };
}
