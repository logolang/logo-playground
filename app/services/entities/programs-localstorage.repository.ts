import { RandomHelper } from 'app/utils/random-helper';

export type lang = "logo";

export type ProgramStorageType = "library" | "samples" | "gist";

export interface Program {
    id: string
    name: string
    lang: lang
    code: string
    screenshot: string
    dateCreated: string
    dateLastEdited: string
}

export interface IProgramsRepository {
    getAll(): Promise<Program[]>
    get(id: string): Promise<Program>
    add(program: Program): Promise<void>
    update(program: Program): Promise<void>
    remove(id: string): Promise<void>
}

export class ProgramsLocalStorageRepository implements IProgramsRepository {
    storage: Storage = window.localStorage;
    constructor() {
    }

    async getAll(): Promise<Program[]> {
        let programs: Program[] = [];
        for (let keyIndex = 0; keyIndex < this.storage.length; ++keyIndex) {
            const key = this.storage.key(keyIndex);
            if (key !== null && key.startsWith("program")) {
                const value = this.storage.getItem(key);
                let program: Program | null = null;
                if (value !== null) {
                    try {
                        program = JSON.parse(value) as Program;
                        programs.push(program);
                    }
                    catch (ex) { }
                }
            }
        }
        return programs;
    }

    async get(id: string): Promise<Program> {
        const data = this.storage.getItem(this.getStorageKey(id));
        if (data !== null) {
            try {
                return JSON.parse(data) as Program;
            }
            catch (ex) {
            }
        }
        throw new Error(`Program with id ${id} is not found`);
    }

    async add(program: Program): Promise<void> {
        program.id = RandomHelper.getRandomObjectId(32);
        program.dateCreated = new Date().toUTCString();
        program.dateLastEdited = new Date().toUTCString();
        this.storage.setItem(this.getStorageKey(program.id), JSON.stringify(program));
    }

    async update(program: Program): Promise<void> {
        program.dateLastEdited = new Date().toUTCString();
        this.storage.setItem(this.getStorageKey(program.id), JSON.stringify(program));
    }

    async remove(id: string): Promise<void> {
        this.storage.removeItem(this.getStorageKey(id));
    }

    private getStorageKey(id: string) {
        return `program_${id}`;
    }
}