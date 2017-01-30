import { IAjaxService } from './ajax-service';

export class FakeAjaxService implements IAjaxService {
    constructor(private fakeObj?: any) {
    }

    setup(fakeObj: any) {
        this.fakeObj = fakeObj;
    }

    ajax<T>(url: string, method: "post" | "get", body?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.fakeObj);
            }, 100);
        });
    }
}