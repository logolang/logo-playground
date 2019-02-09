import * as LZString from "lz-string";
import { normalizeError } from "app/utils/error";

export class SharedProgramsUrlEncoder {
  constructor() {
    /** */
  }

  async get(id: string): Promise<{ name: string; text: string }> {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(decodeURIComponent(id));
      const { name, text } = JSON.parse(decompressed);
      if (!name || !text) {
        throw new Error("Error during decoding of shared program");
      }
      return { name, text };
    } catch (ex) {
      const err = await normalizeError(ex);
      return { name: "Error", text: err.message };
    }
  }

  async post(name: string, text: string): Promise<string> {
    const json = JSON.stringify({ name, text });
    const id = LZString.compressToEncodedURIComponent(json);
    return id;
  }
}
