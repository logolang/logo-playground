import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";
import { ProgramModel } from "app/services/program/program.model";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

const programs: ProgramModel[] = [
  {
    id: "1",
    code: "<>!@#^$%&@#$'",
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    lang: "logo",
    name: "prog1",
    screenshot: "ABCABCKJSFA",
    hasTempLocalModifications: false,
    storageType: undefined
  },
  {
    id: "2",
    code: "<>!@#^$%&@#$'",
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    lang: "logo",
    name: "prog1",
    screenshot: "ABCABCKJSFA",
    hasTempLocalModifications: false,
    storageType: undefined
  }
];

describe("Programs HTML serializer service", () => {
  const service = new ProgramsHtmlSerializerService();

  it("should serialize programs to html string", () => {
    const serialized = service.serialize(programs);
    chai.expect(serialized).to.be.not.empty;
    chai.expect(serialized).to.contain("<html>");
  });

  it("should deserialize programs to same objects", () => {
    const serialized = service.serialize(programs);
    const deserialized = service.parse(serialized);
    chai.expect(deserialized).to.be.eql(programs);
  });

  it("should deserialize empty string to empty array", () => {
    const deserialized = service.parse("");
    chai.expect(deserialized).to.be.eql([]);
  });
});
