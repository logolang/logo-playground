import { stay } from "app/utils/async";
import { AjaxService } from "../infrastructure/ajax-service";
import { DictionaryLike } from "app/utils/syntax";

export class FakeAjaxService implements AjaxService {
  constructor(private objUrlMap: DictionaryLike<object>) {}

  set(resourceUrl: string, result: object) {
    this.objUrlMap[resourceUrl] = result;
  }

  async getText(url: string): Promise<string> {
    return this.ajax<string>(url, "get");
  }

  async ajax<T>(ajaxUrl: string, method: "post" | "get", body?: string): Promise<T> {
    await stay(100);
    let matched = "";

    for (const resUrl in this.objUrlMap) {
      if (ajaxUrl.startsWith(resUrl)) {
        matched = resUrl;
      }
    }

    if (matched) {
      return (this.objUrlMap[matched] as any) as T;
    } else {
      throw new Error(`Resource with url: ${ajaxUrl} is not mocked`);
    }
  }
}
