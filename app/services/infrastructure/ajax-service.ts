import * as fetch from 'isomorphic-fetch';
import { handleAsyncError } from "app/utils/async-helpers";

export interface IAjaxService {
    getText(url: string): Promise<string>
    ajax<T>(url: string, method: "post" | "get", body?: string): Promise<T>
}

export class AjaxService {
    async getText(url: string): Promise<string> {
        const result = await fetch(url, {
            credentials: 'same-origin',
            method: 'get'
        });

        if (result.ok) {
            return result.text()
        }
        console.error('ajax request failed', result.statusText);
        throw await handleAsyncError(result);
    }

    async ajax<T>(url: string, method: "post" | "get", body?: string): Promise<T> {
        const result = await fetch(url, {
            credentials: 'same-origin',
            method: method,
            body: method == "post" ? body : undefined
        });

        if (result.ok) {
            return result.json()
        }
        console.error('ajax request failed', result.statusText);
        throw await handleAsyncError(result);
    }
}