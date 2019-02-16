import { formatId } from "app/utils/formatter";

import { ProgramModel, ProgramStorageType } from "app/services/program/program.model";
import { ProgramsHtmlSerializer } from "app/services/gallery/programs-html-serializer";
import { DictionaryLike } from "app/utils/syntax";

export class GallerySamplesRepository {
  private cached_programs: DictionaryLike<ProgramModel[]> = {};

  async getAll(libName: string): Promise<ProgramModel[]> {
    if (this.cached_programs[libName]) {
      return this.cached_programs[libName];
    }

    const result = await fetch(`content/${libName}.html`, {
      method: "get",
      credentials: "same-origin"
    });
    if (!result.ok) {
      throw result;
    }

    const html = await result.text();
    const parser = new ProgramsHtmlSerializer(window);
    const data = parser.parse(html);

    for (const pr of data) {
      // generate readable ids
      pr.id = libName + "-" + formatId(pr.name, id => !!data.find(p => p.id === id));
      pr.storageType = ProgramStorageType.samples;
    }

    data.sort((p1, p2) => {
      return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1;
    });

    this.cached_programs[libName] = data;

    return data;
  }

  async get(id: string): Promise<ProgramModel> {
    const sepIndex = id.indexOf("-");
    if (sepIndex <= 0) {
      throw new Error("Wrong id for sample");
    }
    const libName = id.substr(0, sepIndex);
    const data = await this.getAll(libName);
    const p = data.find(d => d.id === id);
    if (!p) {
      throw new Error(`Program with id ${id} is not found`);
    }
    return p;
  }
}
