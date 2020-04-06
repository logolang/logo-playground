import { ProgramModel } from "services/program.model";
import { GalleryService } from "services/gallery.service";
import { ProgramsHtmlSerializer } from "./programs-html-serializer";

function getIncrementalName(name: string, checkExist: (name: string) => boolean) {
  let counter = 1;
  let namecandidate = "";
  do {
    namecandidate = counter > 1 ? `${name} (${counter})` : name;
    counter++;
  } while (checkExist(namecandidate));
  return namecandidate;
}

export class GalleryImportService {
  constructor(private galleryService: GalleryService) {}

  async import(programsHtml: string) {
    const programs = new ProgramsHtmlSerializer(window.document).parse(programsHtml);
    return this.importAll(programs);
  }

  async importAll(importingPrograms: ProgramModel[]): Promise<number> {
    const existingPrograms = (await this.galleryService.getAll()) || [];
    const programsToAdd: ProgramModel[] = [];
    let added = 0;
    for (const importingProgram of importingPrograms) {
      // try to find already existing program with this id
      const existingProgramById = existingPrograms.find(ep => ep.id === importingProgram.id);
      if (existingProgramById) {
        // check if source code is the same
        if (existingProgramById.code === importingProgram.code) {
          // ignore the progmam in this case
        } else {
          // add copy of program
          importingProgram.id = "";
          importingProgram.name = getIncrementalName(importingProgram.name, n =>
            existingPrograms.some(p => p.name === n)
          );
          programsToAdd.push(importingProgram);

          added++;
        }
      } else {
        importingProgram.name = getIncrementalName(importingProgram.name, n =>
          existingPrograms.some(p => p.name === n)
        );
        programsToAdd.push(importingProgram);
        added++;
      }
    }
    await this.galleryService.add(programsToAdd);
    return added;
  }
}
