export type lang = "logo";

export class ProgramModel {
    id: string
    name: string
    lang: lang
    code: string
    screenshot: string
    dateCreated: Date
    dateLastEdited: Date

    constructor(id: string, name: string, lang: lang, code: string, screenshot: string) {
        this.id = id;
        this.name = name;
        this.lang = lang;
        this.code = code;
        this.screenshot = screenshot;
        this.dateCreated = new Date(0);
        this.dateLastEdited = new Date(0);
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    public static fromJson(parsedJson: object): ProgramModel {
        const obj = parsedJson as any;
        // check imported program object
        if (!obj.code
            || !obj.dateCreated
            || !obj.dateLastEdited
            || !obj.id
            || !obj.lang
            || !obj.name
            || !obj.screenshot) {
            throw new Error(`Wrong JSON object`);
        }
        const program = new ProgramModel(obj.id, obj.name, obj.lang, obj.code, obj.screenshot);
        program.dateCreated = new Date(obj.dateCreated);
        program.dateLastEdited = new Date(obj.dateLastEdited);
        return program;
    }
}

export interface IProgramModel extends ProgramModel {
}