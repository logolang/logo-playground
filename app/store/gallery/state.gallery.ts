import { ProgramModel } from "app/services/program/program.model";

export enum GallerySection {
  PersonalLibrary = "library",
  ExamplesAdvanced = "examples",
  ExamplesBasic = "shapes"
}

export interface GalleryState {
  activeSection: GallerySection;
  programs: ProgramModel[];
  isLoading: boolean;

  showImportModal: boolean;
  importErrorMessage?: string;
  isImportInProgress: boolean;
}

export const defaultGalleryState: GalleryState = {
  activeSection: GallerySection.ExamplesAdvanced,
  isLoading: true,
  programs: [],
  showImportModal: false,
  isImportInProgress: false
};
