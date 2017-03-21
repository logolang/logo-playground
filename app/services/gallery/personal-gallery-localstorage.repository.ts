import { RandomHelper } from 'app/utils/random-helper';
import { ICurrentUserProvider } from "app/services/login/current-user.provider";
import { stay } from "app/utils/async-helpers";

export type lang = "logo";

export type ProgramStorageType = "library" | "samples" | "gist";

export interface Program {
    id: string
    name: string
    lang: lang
    code: string
    screenshot: string
    dateCreated: Date
    dateLastEdited: Date
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
    constructor(private currentUser: ICurrentUserProvider) {
    }

    async getAll(): Promise<Program[]> {
        //await stay(2000);
        let programs: Program[] = [];
        for (let keyIndex = 0; keyIndex < this.storage.length; ++keyIndex) {
            const key = this.storage.key(keyIndex);
            if (key !== null && key.startsWith(this.getStorageKeyPrefix())) {
                let program = this.getProgramFromStorage(key);
                if (program) {
                    programs.push(program);
                }
            }
        }
        programs = programs.sort((p1, p2) => { return p1.dateLastEdited > p2.dateLastEdited ? -1 : 1 });
        return programs;
    }

    async get(id: string): Promise<Program> {
        let program = this.getProgramFromStorage(this.getStorageKey(id));
        if (program) {
            return program;
        }
        throw new Error(`Program with id ${id} is not found`);
    }

    async add(program: Program): Promise<void> {
        program.id = RandomHelper.getRandomObjectId(32);
        program.dateCreated = new Date();
        program.dateLastEdited = new Date();
        this.storage.setItem(this.getStorageKey(program.id), JSON.stringify(program));
    }

    async update(program: Program): Promise<void> {
        program.dateLastEdited = new Date();
        this.storage.setItem(this.getStorageKey(program.id), JSON.stringify(program));
    }

    async remove(id: string): Promise<void> {
        this.storage.removeItem(this.getStorageKey(id));
    }

    private getStorageKeyPrefix() {
        const loginStatus = this.currentUser.getLoginStatus();
        if (loginStatus.isLoggedIn) {
            return loginStatus.userInfo.id + ":program:";
        } else {
            return 'program_';
        }
    }

    private getStorageKey(id: string) {
        return `${this.getStorageKeyPrefix()}${id}`;
    }

    private getProgramFromStorage(storageKey: string): Program | undefined {
        const data = this.storage.getItem(storageKey);
        if (data !== null) {
            try {
                let program = JSON.parse(data) as Program;
                program.dateCreated = new Date(program.dateCreated);
                program.dateLastEdited = new Date(program.dateLastEdited);
                return program;
            }
            catch (ex) {
                console.error('Error during parsing the program', data, ex);
            }
        }
        return undefined;
    }
}