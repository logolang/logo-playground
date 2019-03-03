import * as React from "react";
import * as chai from "chai";
import * as sinon from "sinon";
import { shallow, mount, render } from "enzyme";

import { resetBindings, registerMockService } from "utils/di";
import { Gallery } from "./gallery";
import { GallerySection } from "store/gallery/state.gallery";
import { AuthProvider, UserData } from "services/infrastructure/auth-service";
import { NoData } from "ui/_generic/no-data";
import { EventsTrackingService } from "services/infrastructure/events-tracking.service";
import { ProgramStorageType, ProgramModel } from "services/program.model";
import { TileGrid } from "ui/_generic/tile-grid";
import { $T } from "i18n-strings";

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

describe("Gallery component", () => {
  const fakeUser: UserData = {
    isLoggedIn: true,
    name: "Test user",
    id: "0",
    imageUrl: "",
    authProvider: AuthProvider.google,
    email: "test@example.org"
  };

  before(() => {
    resetBindings();
    registerMockService(EventsTrackingService, { sendEvent: sinon.fake() });
  });

  it("should render no programs message for empty gallery", async () => {
    const wrapper = shallow(
      <Gallery
        activeSection={GallerySection.PersonalLibrary}
        programs={[]}
        user={fakeUser}
        isLoading={false}
        selectSection={() => 0}
        showImportModal={() => 0}
      />
    );

    chai.expect(wrapper.find(NoData)).to.have.lengthOf(1);
    chai.expect(wrapper.find(NoData).props().description).equal($T.gallery.emptyLibrary);
  });

  it("should render 2 tiles for samples", async () => {
    const wrapper = shallow(
      <Gallery
        activeSection={GallerySection.ExamplesBasic}
        programs={[fakeProgram("prog1"), fakeProgram("prog2")]}
        user={fakeUser}
        isLoading={false}
        selectSection={() => 0}
        showImportModal={() => 0}
      />
    );

    chai.expect(wrapper.find(TileGrid)).to.have.lengthOf(1);
    chai.expect(wrapper.find(TileGrid).props().tiles).to.have.lengthOf(2);
  });
});
