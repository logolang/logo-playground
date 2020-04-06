import { ProgramModel, ProgramStorageType } from "services/program.model";
import { createCompareFunction, DictionaryLike } from "utils/syntax";
import { $T } from "i18n-strings";

const userpicImgCache: DictionaryLike<string> = {};

export class ProgramsHtmlSerializer {
  constructor(private document: Document) {}

  public parse(serialized: string): ProgramModel[] {
    const result: ProgramModel[] = [];
    const bodyStartIndex = serialized.indexOf("<body");
    const bodyEndIndex = serialized.indexOf("</html>");
    if (bodyStartIndex < 0 || bodyEndIndex < 0) {
      throw new Error($T.gallery.wrongFileFormatForImport);
    }
    const bodyXml = serialized.substring(bodyStartIndex, bodyEndIndex);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(bodyXml, "application/xml");

    const articles = xmlDoc.querySelectorAll(".logo-program");
    for (let i = 0; i < articles.length; ++i) {
      const articleElement = articles.item(i);
      const imgElement = articleElement.querySelector("img");
      const screenShotUrl = imgElement ? imgElement.getAttribute("src") || "" : "";
      const preElement = articleElement.querySelector("pre");
      const code = preElement ? preElement.textContent || "" : "";
      const program: ProgramModel = {
        id: articleElement.getAttribute("data-program-id") || "",
        name: articleElement.getAttribute("data-program-name") || "",
        dateCreated: new Date(articleElement.getAttribute("data-program-date-created") || ""),
        dateLastEdited: new Date(articleElement.getAttribute("data-program-date-edited") || ""),
        code: code,
        screenshot: screenShotUrl,
        storageType: ProgramStorageType.gallery
      };
      result.push(program);
    }

    return result;
  }

  public async serialize(programs: ProgramModel[], username: string, userpicUrl: string) {
    const sortingFunction = createCompareFunction<ProgramModel>([
      { sortBy: x => x.dateLastEdited, direction: "desc" },
      { sortBy: x => x.name }
    ]);
    const programsSorted = [...programs].sort(sortingFunction);

    const imageData64Url =
      userpicImgCache[userpicUrl] ||
      (userpicImgCache[userpicUrl] = await this.getImageBase64ByUrl(userpicUrl));

    const headBlock = `<head>
  <title>Logo personal library</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>  
    body {
      margin: 20px 100px;
      font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
      font-weight: 300;
    }

    header {
      padding: 10px;
      border-bottom: 1px solid gray;
    }

    td {
      vertical-align: top;
      padding: 10px;
    }

    pre {
      background-color: #eee;
      padding: 20px;
    }
  </style>
</head>
`;

    const body = this.document.createElement("body");
    const header = this.document.createElement("header");
    body.appendChild(header);

    const headerH1 = this.document.createElement("h1");
    headerH1.innerText = "Logo personal library";
    header.appendChild(headerH1);

    const headerH3 = this.document.createElement("h3");
    headerH3.innerText = username;
    header.appendChild(headerH3);

    if (imageData64Url) {
      const headerImg = this.document.createElement("img");
      headerImg.setAttribute("src", imageData64Url);
      header.appendChild(headerImg);
    }

    const table = this.document.createElement("table");
    body.appendChild(table);
    const tbody = this.document.createElement("tbody");
    table.appendChild(tbody);

    const rows = programsSorted.map(p => this.serializeProgramToHtmlNode(p));
    for (const row of rows) {
      tbody.appendChild(row);
    }

    return (
      "<!DOCTYPE html><html>" + headBlock + new XMLSerializer().serializeToString(body) + "</html>"
    );
  }

  private serializeProgramToHtmlNode(program: ProgramModel) {
    const tr = this.document.createElement("tr");
    tr.className = "logo-program";
    tr.setAttribute("data-program-id", program.id);
    tr.setAttribute("data-program-name", program.name);
    tr.setAttribute("data-program-date-created", program.dateCreated.toUTCString());
    tr.setAttribute("data-program-date-edited", program.dateLastEdited.toUTCString());

    const td1 = this.document.createElement("td");
    tr.appendChild(td1);
    const programNameElt = this.document.createElement("strong");
    programNameElt.innerText = program.name;
    td1.appendChild(programNameElt);

    td1.appendChild(this.document.createElement("br"));

    const programDateElt = this.document.createElement("small");
    programDateElt.innerText = program.dateLastEdited.toLocaleDateString();
    td1.appendChild(programDateElt);

    td1.appendChild(this.document.createElement("br"));
    td1.appendChild(this.document.createElement("br"));

    if (program.screenshot) {
      const img = this.document.createElement("img");
      img.setAttribute("src", program.screenshot);
      td1.appendChild(img);
    }

    const td2 = this.document.createElement("td");
    tr.appendChild(td2);
    const pre = this.document.createElement("pre");
    pre.appendChild(this.document.createTextNode(program.code));
    td2.appendChild(pre);
    tr.appendChild(td2);

    return tr;
  }

  private async getImageBase64ByUrl(imgUrl: string): Promise<string> {
    if (!imgUrl) {
      return "";
    }
    return new Promise<string>(resolve => {
      const imgElt = this.document.createElement("img");
      imgElt.addEventListener("load", () => {
        try {
          const canvasElt = this.document.createElement("canvas");
          canvasElt.width = 64;
          canvasElt.height = 64;
          const ctx = canvasElt.getContext("2d");
          if (!ctx) {
            resolve("");
            return;
          }
          ctx.drawImage(imgElt, 0, 0, 64, 64);
          const dataURL = canvasElt.toDataURL("image/jpeg", 0.75);
          resolve(dataURL);
        } catch (ex) {
          resolve("");
        }
      });
      imgElt.addEventListener("error", () => {
        resolve("");
      });
      imgElt.setAttribute("crossOrigin", "Anonymous");
      imgElt.setAttribute("src", imgUrl);
    });
  }
}
