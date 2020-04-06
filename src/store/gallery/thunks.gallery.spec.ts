/* eslint-disable @typescript-eslint/no-explicit-any */
import * as chai from "chai";
import * as sinon from "sinon";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { resetBindings, registerMockService } from "utils/di";
import { getDefaultState } from "store/store";
import { galleryThunks } from "./thunks.gallery";
import { GallerySection } from "./state.gallery";
import { GalleryActionType } from "./actions.gallery";
import { GallerySamplesRepository } from "services/gallery-samples.repository";
import { ProgramModel, ProgramStorageType } from "services/program.model";
import { GalleryService } from "services/gallery.service";

const mockStore = configureMockStore([thunk]);

function fakeProgram(name: string, storageType?: ProgramStorageType): ProgramModel {
  return {
    id: name,
    name: name,
    code: name,
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    screenshot: "",
    storageType: storageType || ProgramStorageType.samples
  };
}

describe("Gallery thunks", () => {
  beforeEach(() => {
    resetBindings();
  });

  it("should call samples repos to load examples", async () => {
    const store = mockStore(getDefaultState());

    registerMockService(GallerySamplesRepository, {
      getAll: sinon.fake.returns([fakeProgram("prog1")])
    });

    await store.dispatch(galleryThunks.loadSection(GallerySection.ExamplesBasic) as any);
    const actions = store.getActions();
    chai.expect(actions[0].type).equal(GalleryActionType.LOAD_SECTION_STARTED);
    chai.expect(actions[1].type).equal(GalleryActionType.LOAD_SECTION_COMPLETED);
    chai.expect(actions[1].payload.section).equal(GallerySection.ExamplesBasic);
    chai.expect(actions[1].payload.programs.length).equal(1);
    chai.expect(actions[1].payload.programs[0]).eql(fakeProgram("prog1"));
    chai.expect(actions.length).equal(2);
  });

  it("should call service to load gallery from remote only", async () => {
    const store = mockStore(getDefaultState());

    registerMockService(GalleryService, {
      getAllLocal: sinon.fake.returns([]),
      getAll: sinon.fake.returns([fakeProgram("prog1")])
    });

    await store.dispatch(galleryThunks.loadSection(GallerySection.PersonalLibrary) as any);
    const actions = store.getActions();
    chai.expect(actions[0].type).equal(GalleryActionType.LOAD_SECTION_STARTED);
    chai.expect(actions[1].type).equal(GalleryActionType.LOAD_SECTION_COMPLETED);
    chai.expect(actions[1].payload.section).equal(GallerySection.PersonalLibrary);
    chai.expect(actions[1].payload.programs).eql([fakeProgram("prog1")]);
    chai.expect(actions.length).equal(2);
  });

  it("should call service to load gallery from local and remote", async () => {
    const store = mockStore(getDefaultState());

    registerMockService(GalleryService, {
      getAllLocal: sinon.fake.returns([fakeProgram("prog1")]),
      getAll: sinon.fake.returns([fakeProgram("prog1"), fakeProgram("prog2")])
    });

    await store.dispatch(galleryThunks.loadSection(GallerySection.PersonalLibrary) as any);
    const actions = store.getActions();
    chai.expect(actions[0].type).equal(GalleryActionType.LOAD_SECTION_STARTED);
    chai.expect(actions[1].type).equal(GalleryActionType.LOAD_SECTION_COMPLETED);
    chai.expect(actions[1].payload.programs).eql([fakeProgram("prog1")]);
    chai.expect(actions[2].type).equal(GalleryActionType.LOAD_SECTION_COMPLETED);
    chai.expect(actions[2].payload.programs).eql([fakeProgram("prog1"), fakeProgram("prog2")]);
    chai.expect(actions.length).equal(3);
  });
});
