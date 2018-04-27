import { getFileExtension, parseDateFromJson, stringifyDateAsJson } from "./formatter-helper";
import { createCompareFunction } from "./syntax-helpers";

interface Person {
  name: string;
  height: number;
  dob: Date;
}
const Adam_160_1984: Person = { name: "Adam", height: 160, dob: new Date("01/01/1984") };
const Bart_180_1913: Person = { name: "Bart", height: 180, dob: new Date("01/01/1913") };
const Dora_170_2000: Person = { name: "Dora", height: 170, dob: new Date("01/01/2000") };
const Dora_160_2000: Person = { name: "Dora", height: 160, dob: new Date("01/01/2000") };
const Wood_160_2018: Person = { name: "Wood", height: 160, dob: new Date("01/01/2018") };

describe("createCompareFunction", () => {
  function check(arr1: Person[], arr2: Person[]) {
    const s = (p: Person) => p.name + "_" + p.height + "_" + p.dob.getFullYear();
    const s1 = arr1.map(p => s(p)).join();
    const s2 = arr2.map(p => s(p)).join();
    chai.expect(s1).to.be.equal(s2);
  }

  it("should sort by name correctly", () => {
    const sample = [Adam_160_1984, Dora_170_2000, Bart_180_1913];
    sample.sort(createCompareFunction([{ sortBy: x => x.name }]));
    const expected = [Adam_160_1984, Bart_180_1913, Dora_170_2000];
    check(sample, expected);
  });

  it("should sort by name correctly with desc", () => {
    const sample = [Adam_160_1984, Dora_170_2000, Bart_180_1913];
    sample.sort(createCompareFunction([{ sortBy: x => x.name, direction: "desc" }]));
    const expected = [Dora_170_2000, Bart_180_1913, Adam_160_1984];
    check(sample, expected);
  });

  it("should sort by 2 criterions", () => {
    const sample = [Wood_160_2018, Dora_170_2000, Bart_180_1913, Dora_160_2000, Adam_160_1984];
    sample.sort(createCompareFunction([{ sortBy: x => x.height }, { sortBy: x => x.name }]));
    const expected = [Adam_160_1984, Dora_160_2000, Wood_160_2018, Dora_170_2000, Bart_180_1913];
    check(sample, expected);
  });

  it("should sort by date, and height asc", () => {
    const sample = [Dora_170_2000, Dora_160_2000, Wood_160_2018, Bart_180_1913, Adam_160_1984];
    sample.sort(
      createCompareFunction([{ sortBy: x => x.dob, direction: "asc" }, { sortBy: x => x.height, direction: "asc" }])
    );
    const expected = [Bart_180_1913, Adam_160_1984, Dora_160_2000, Dora_170_2000, Wood_160_2018];
    check(sample, expected);
  });

  it("should sort by date, and height desc", () => {
    const sample = [Wood_160_2018, Dora_170_2000, Bart_180_1913, Dora_160_2000, Adam_160_1984];
    sample.sort(
      createCompareFunction([{ sortBy: x => x.dob, direction: "asc" }, { sortBy: x => x.height, direction: "desc" }])
    );
    const expected = [Bart_180_1913, Adam_160_1984, Dora_170_2000, Dora_160_2000, Wood_160_2018];
    check(sample, expected);
  });
});
