import { ProgramsHtmlSerializer } from "app/services/gallery/programs-html-serializer";
import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { createCompareFunction } from "app/utils/syntax";

const programsSpecialCharacters: ProgramModel[] = [
  {
    id: "1",
    code: "prog 1 <>!@#^$%&@#$'",
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    name: "prog1",
    screenshot: "s1",
    storageType: ProgramStorageType.gallery
  },
  {
    id: "2",
    code: "prog 2 <>!@#^$%&@#$'",
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    name: "prog2",
    screenshot: "s2",
    storageType: ProgramStorageType.gallery
  }
];

const programs: ProgramModel[] = [
  {
    id: "1",
    code: "fd 10",
    dateCreated: new Date(0),
    dateLastEdited: new Date(0),
    name: "prog1",
    screenshot:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    storageType: ProgramStorageType.gallery
  }
];

const sortFn = createCompareFunction<ProgramModel>([{ sortBy: x => x.name }]);

describe("Programs HTML serializer service", () => {
  programsSpecialCharacters.sort(sortFn);
  const service = new ProgramsHtmlSerializer();

  it("should serialize programs to html string", async () => {
    const serialized = await service.serialize(programsSpecialCharacters, "Olek", "");
    chai.expect(serialized).to.be.not.empty;
    chai.expect(serialized).to.contain("<html>");
  });

  it("should deserialize programs with special characters to same objects", async () => {
    const serialized = await service.serialize(programsSpecialCharacters, "Olek", "");
    const deserialized = service.parse(serialized);
    deserialized.sort(sortFn);
    chai.expect(deserialized).to.be.eql(programsSpecialCharacters);
  });

  it("should deserialize programs to same objects", async () => {
    const serialized = await service.serialize(programs, "Olek", "");
    const deserialized = service.parse(serialized);
    chai.expect(deserialized).to.be.eql(programs);
  });

  it("should deserialize empty string to empty array", () => {
    const deserialized = service.parse("");
    chai.expect(deserialized).to.be.eql([]);
  });
});
