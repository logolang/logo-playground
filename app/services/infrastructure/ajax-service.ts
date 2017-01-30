import * as fetch from 'isomorphic-fetch';

export interface IAjaxService {
    ajax<T>(url: string, method: "post" | "get", body?: string, istext?: boolean): Promise<T>;
}

export class AjaxService {
    async ajax<T>(url: string, method: "post" | "get", body?: string, istext?: boolean): Promise<T> {
        const result = await fetch(url, {
            credentials: 'same-origin',
            method: method,
            body: method == "post" ? body : undefined
        });

        if (result.ok) {
            return istext
                ? result.text()
                : result.json()
        }
        console.error('ajax request failed', result.statusText);
        throw new Error(result.statusText);
    }
}