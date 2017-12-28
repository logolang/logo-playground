import { injectable } from "app/di";

@injectable()
export class TitleService {
  constructor(private prefix: string) {}

  setDocumentTitle(title: string) {
    document.title = title ? this.prefix + " - " + title : this.prefix;
  }
}

export interface ITitleService extends TitleService {}
