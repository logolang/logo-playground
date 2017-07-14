export type lang = "logo";

export class ProgramModel {
  id: string;
  name: string;
  lang: lang;
  code: string;
  screenshot: string;
  dateCreated: Date;
  dateLastEdited: Date;

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
    if (!obj.code) {
      throw new Error(`Wrong program object: field 'code' is not defined`);
    }
    if (!obj.dateCreated) {
      throw new Error(`Wrong program object: field 'dateCreated' is not defined`);
    }
    if (!obj.dateLastEdited) {
      throw new Error(`Wrong program object: field 'dateLastEdited' is not defined`);
    }
    if (!obj.id) {
      throw new Error(`Wrong program object: field 'id' is not defined`);
    }
    if (!obj.lang) {
      throw new Error(`Wrong program object: field 'lang' is not defined`);
    }
    if (!obj.name) {
      throw new Error(`Wrong program object: field 'name' is not defined`);
    }

    const program = new ProgramModel(obj.id, obj.name, obj.lang, obj.code, obj.screenshot || "");
    program.dateCreated = new Date(obj.dateCreated);
    program.dateLastEdited = new Date(obj.dateLastEdited);
    return program;
  }
}

export interface IProgramModel extends ProgramModel {}
