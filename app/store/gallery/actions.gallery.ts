import { Dispatch } from "react";
import { Action } from "redux";
import { action, ActionType } from "typesafe-actions";

import { createCompareFunction } from "app/utils/syntax";
import { resolveInject } from "app/di";
import { GallerySection } from "./state.gallery";
import { GetState } from "app/store/store";
import { ProgramModel } from "app/services/program/program.model";
import { GallerySamplesRepository } from "app/services/gallery/gallery-samples.repository";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";

export enum GalleryActionType {
  LOAD_SECTION_STARTED = "LOAD_SECTION_STARTED",
  LOAD_SECTION_COMPLETED = "LOAD_SECTION_COMPLETED"
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
    })
};

function loadSectionThunk(section: GallerySection, options?: { forceLoad: boolean }) {
  return async (dispatch: Dispatch<Action>, getState: GetState) => {
    const state = getState().gallery;
    if (state.activeSection === section && state.programs.length > 0) {
      if (!options || !options.forceLoad) {
        return;
      }
    }
    dispatch(galleryActionCreator.loadSectionStarted(section));

    const sortingFunction = createCompareFunction<ProgramModel>([
      { sortBy: x => x.dateLastEdited, direction: "desc" },
      { sortBy: x => x.name }
    ]);

    const samplesRepo = resolveInject(GallerySamplesRepository);
    const galleryService = resolveInject(PersonalGalleryService);

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
        const cachedPrograms = await galleryService.getAllLocal();
        if (cachedPrograms.length > 0) {
          cachedPrograms.sort(sortingFunction);
          dispatch(galleryActionCreator.loadSectionCompleted(section, cachedPrograms));
        }

        const programsFromRemote = await galleryService.getAll();
        programsFromRemote.sort(sortingFunction);
        dispatch(galleryActionCreator.loadSectionCompleted(section, programsFromRemote));
    }
  };
}

export type GalleryAction = ActionType<typeof galleryActionCreator>;
