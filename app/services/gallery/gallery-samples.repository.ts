import { ProgramModel } from "app/services/gallery/program.model";
import { IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";

const data = require<object[]>('./gallery-samples.json').map(rec => ProgramModel.fromJson(rec));
data.sort((p1, p2) => { return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1 });

export class ProgramsSamplesRepository implements IProgramsRepository {
    constructor() {
    }

    async getAll(): Promise<ProgramModel[]> {
        return data;
    }

    async get(id: string): Promise<ProgramModel> {
        const p = data.find(d => d.id === id);
        if (!p) {
            throw new Error(`Program with id ${id} is not found`);
        }
        return p;
    }

    async add(program: ProgramModel): Promise<ProgramModel> {
        throw new Error();
    }

    async update(program: ProgramModel): Promise<void> {
        throw new Error();
    }

    async remove(id: string): Promise<void> {
        throw new Error();
    }
}