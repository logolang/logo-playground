import { Program, IProgramsRepository } from "app/services/gallery/personal-gallery-localstorage.repository";

const data = require<Program[]>('app/resources/samples/programs.json');
data.forEach(p => {
    p.dateCreated = new Date(p.dateCreated);
    p.dateLastEdited = new Date(p.dateLastEdited);
});
data.sort((p1, p2) => { return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1 });

export class ProgramsSamplesRepository implements IProgramsRepository {
    constructor() {
    }

    async getAll(): Promise<Program[]> {
        return data;
    }

    async get(id: string): Promise<Program> {
        const p = data.find(d => d.id === id);
        if (!p) {
            throw new Error(`Program with id ${id} is not found`);
        }
        return p;
    }

    async add(program: Program): Promise<void> {
        throw new Error();
    }

    async update(program: Program): Promise<void> {
        throw new Error();
    }

    async remove(id: string): Promise<void> {
        throw new Error();
    }
}