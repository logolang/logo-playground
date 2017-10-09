import { ProgramModel } from "app/services/program/program.model";
import { IUserLibraryRepository } from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramModelConverter } from "app/services/program/program-model.converter";

function getIncrementalName(name: string, checkExist: (name: string) => boolean) {
  let counter = 1;
  let namecandidate = "";
  do {
    namecandidate = counter > 1 ? `${name} (${counter})` : name;
    counter++;
  } while (checkExist(namecandidate));
  return namecandidate;
}

export class ProgramsExportImportService {
  async exportAll(repository: IUserLibraryRepository): Promise<string> {
    const programs = await repository.getAll();
    const data = JSON.stringify(programs, null, 2);
    return data;
  }

  async importAll(repository: IUserLibraryRepository, data: string): Promise<number> {
    const importingPrograms = JSON.parse(data) as object[];
    const existingPrograms = await repository.getAll();
    let added = 0;
    for (const importingProgramRaw of importingPrograms) {
      let importingProgram: ProgramModel | undefined = undefined;
      try {
        importingProgram = ProgramModelConverter.fromJson(importingProgramRaw);
      } catch (err) {
        /*suppress error*/
      }
      if (!importingProgram) {
        continue;
      }

      // try to find already existing program with this id
      const existingProgramById = existingPrograms.find(ep => ep.id === importingProgram!.id);
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
          await repository.add(importingProgram);
          added++;
        }
      } else {
        importingProgram.name = getIncrementalName(importingProgram.name, n =>
          existingPrograms.some(p => p.name === n)
        );
        await repository.add(importingProgram);
        added++;
      }
    }
    return added;
  }
}
