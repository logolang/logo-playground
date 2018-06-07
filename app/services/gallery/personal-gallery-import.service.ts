import { ProgramModel } from "app/services/program/program.model";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";

function getIncrementalName(name: string, checkExist: (name: string) => boolean) {
  let counter = 1;
  let namecandidate = "";
  do {
    namecandidate = counter > 1 ? `${name} (${counter})` : name;
    counter++;
  } while (checkExist(namecandidate));
  return namecandidate;
}

export class PersonalGalleryImportService {
  async importAll(galleryService: PersonalGalleryService, importingPrograms: ProgramModel[]): Promise<number> {
    const existingPrograms = (await galleryService.getAll()) || [];
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
    await galleryService.add(programsToAdd);
    return added;
  }
}
