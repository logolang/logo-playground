import * as fetch from "isomorphic-fetch";
import { injectable } from "app/di";

export abstract class IAjaxService {
  abstract getText(url: string): Promise<string>;
  abstract ajax<T>(url: string, method: "post" | "get", body?: string): Promise<T>;
}

@injectable()
export class AjaxService {
  async getText(url: string): Promise<string> {
    const result = await fetch(url, {
      credentials: "same-origin",
      method: "get"
    });

    if (result.ok) {
      return result.text();
    }
    throw result;
  }

  async ajax<T>(url: string, method: "post" | "get", body?: string): Promise<T> {
    const result = await fetch(url, {
      credentials: "same-origin",
      method: method,
      body: method == "post" ? body : undefined
    });

    if (result.ok) {
      return result.json();
    }
    throw result;
  }
}
