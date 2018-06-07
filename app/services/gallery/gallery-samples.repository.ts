import { formatId } from "app/utils/formatter-helper";

import { injectable } from "app/di";
import { ProgramModel } from "app/services/program/program.model";
import { AjaxService } from "app/services/infrastructure/ajax-service";
import { ProgramsHtmlSerializerService } from "app/services/gallery/programs-html-serializer.service";

@injectable()
export class GallerySamplesRepository {
  private cached_programs: ProgramModel[] | undefined;

  constructor(private ajax: AjaxService) {}

  async getAll(): Promise<ProgramModel[]> {
    if (this.cached_programs) {
      return this.cached_programs;
    }
    const html = await this.ajax.getText(`content/samples.html`);
    const parser = new ProgramsHtmlSerializerService();
    const data = parser.parse(html);

    for (const pr of data) {
      // generate readable ids
      pr.id = formatId(pr.name, id => !!data.find(p => p.id === id));
    }

    data.sort((p1, p2) => {
      return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1;
    });

    this.cached_programs = data;

    return data;
  }

  async get(id: string): Promise<ProgramModel> {
    const data = await this.getAll();
    const p = data.find(d => d.id === id);
    if (!p) {
      throw new Error(`Program with id ${id} is not found`);
    }
    // return clone of program object - so original will be intact in memory if updates happen
    return { ...p };
  }
}
