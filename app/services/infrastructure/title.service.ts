export class TitleService {
    constructor(private prefix: string) {
    }

    setDocumentTitle(title: string) {
        if (title) {
            document.title = this.prefix + "-" + title;
        }
        else {
            document.title = this.prefix;
        }
    }
}

export interface ITitleService extends TitleService {
}