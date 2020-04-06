import { Dispatch } from "react";
import { Action } from "redux";

import { $T } from "i18n-strings";
import { createCompareFunction } from "utils/syntax";
import { normalizeError } from "utils/error";
import { resolve } from "utils/di";
import { GallerySection } from "./state.gallery";
import { GetState, TDispatch } from "store/store";
import { envActionCreator } from "store/env/actions.env";
import { NotificationType } from "store/env/state.env";
import { ProgramModel } from "services/program.model";
import { GallerySamplesRepository } from "services/gallery-samples.repository";
import { GalleryService } from "services/gallery.service";
import { GalleryImportService } from "services/gallery-import.service";
import { envThunks } from "store/env/thunks.env";
import { galleryActionCreator } from "./actions.gallery";

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

    try {
      switch (section) {
        case GallerySection.ExamplesAdvanced:
          {
            const samplesRepo = resolve(GallerySamplesRepository);
            const samples = await samplesRepo.getAll("gallery");
            samples.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, samples));
          }
          break;
        case GallerySection.ExamplesBasic:
          {
            const samplesRepo = resolve(GallerySamplesRepository);
            const samples = await samplesRepo.getAll("elements");
            samples.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, samples));
          }
          break;
        case GallerySection.PersonalLibrary: {
          const galleryService = resolve(GalleryService);
          const programsFromLocal = galleryService.getAllLocal();
          if (programsFromLocal.length > 0) {
            programsFromLocal.sort(sortingFunction);
            dispatch(galleryActionCreator.loadSectionCompleted(section, programsFromLocal));
          }

          const programsFromRemote = await galleryService.getAll();
          programsFromRemote.sort(sortingFunction);
          dispatch(galleryActionCreator.loadSectionCompleted(section, programsFromRemote));
        }
      }
    } catch (error) {
      const errDef = await normalizeError(error);
      dispatch(envActionCreator.handleError(errDef));
      dispatch(galleryActionCreator.loadSectionCompleted(section, []));
    }
  };
}

function importThunk(programsHtml: string) {
  return async (dispatch: TDispatch) => {
    dispatch(galleryActionCreator.importStarted());
    try {
      const importService = resolve(GalleryImportService);
      const count = await importService.import(programsHtml);
      dispatch(galleryActionCreator.importCompleted(true));
      await dispatch(
        envThunks.showNotificationAutoClose(
          NotificationType.info,
          $T.gallery.importCompletedTitle,
          $T.gallery.addedProgramsMessage.val(count)
        )
      );
      await dispatch(loadSectionThunk(GallerySection.PersonalLibrary, { forceLoad: true }));
    } catch (e) {
      const ex = await normalizeError(e);
      dispatch(galleryActionCreator.importCompleted(false, ex.message));
    }
  };
}

export const galleryThunks = {
  loadSection: loadSectionThunk,
  import: importThunk
};
