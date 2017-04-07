export class TitleService {
    constructor(private prefix: string) {
    }

    setDocumentTitle(title: string) {
        document.title = this.prefix + title;
    }
}

export interface ITitleService extends TitleService {
}