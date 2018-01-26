import { ProgramModel } from "app/services/program/program.model";
import { ProgramStorageType } from "app/services/program/program-management.service";
import { createCompareFuntion } from "app/utils/syntax-helpers";

export class ProgramsHtmlSerializerService {
  public parse(serialized: string): ProgramModel[] {
    const result: ProgramModel[] = [];
    const bodyStartIndex = serialized.indexOf("<body>");
    const bodyEndIndex = serialized.indexOf("</html>");
    const bodyXml = serialized.substring(bodyStartIndex, bodyEndIndex - 1);
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
        lang: "logo",
        screenshot: screenShotUrl,
        hasTempLocalModifications: false,
        storageType: undefined
      };
      result.push(program);
    }

    return result;
  }

  public async serialize(programs: ProgramModel[], username: string, userpicUrl: string) {
    const sortingFunction = createCompareFuntion<ProgramModel>(x => x.dateLastEdited, "desc");
    const programsSorted = [...programs].sort(sortingFunction);

    const imageData64Url = await this.getImageBase64ByUrl(userpicUrl);
    return `<!DOCTYPE html>
    <html>
    <head>
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
    <body>
      <header>
        <h1>Logo personal library</h1>
        <h3>${username}</h3>
        ${imageData64Url ? `<img src="${imageData64Url}"></img>` : ""}
      </header>
      <table>
        <tbody>
          ${programsSorted.map(p => this.serializeProgram(p)).join("")}
        </tbody>
      </table>
    </body>
    </html>
    `;
  }

  private serializeProgram(program: ProgramModel) {
    return `
<tr class="logo-program"
 data-program-id="${program.id}" 
 data-program-name="${program.name}"
 data-program-date-created="${program.dateCreated}"
 data-program-date-edited="${program.dateLastEdited}"
>
  <td>
    <strong>${program.name}</strong>
    <br />
    <small>${program.dateLastEdited}</small>
    <br />
    <br />
    ${this.getImage(program)}
    />
  </td>
  <td>
    <pre>${this.encodeHtml(program.code)}</pre>
  </td>
</tr>
  `;
  }

  private getImage(program: ProgramModel) {
    if (program.screenshot) {
      return `<img alt="Program screenshot" src="${program.screenshot}"`;
    }
    return "";
  }

  private encodeHtml(str: string): string {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    const result = div.innerHTML;
    div.remove();
    return result;
  }

  private async getImageBase64ByUrl(imgUrl: string): Promise<string> {
    if (!imgUrl) {
      return "";
    }
    return new Promise<string>((resolve, reject) => {
      const imgElt = document.createElement("img");
      imgElt.addEventListener("load", () => {
        try {
          const canvasElt = document.createElement("canvas");
          canvasElt.width = imgElt.width;
          canvasElt.height = imgElt.height;
          const ctx = canvasElt.getContext("2d");
          if (!ctx) {
            resolve("");
            return;
          }
          ctx.drawImage(imgElt, 0, 0);
          var dataURL = canvasElt.toDataURL("image/jpeg", 0.5);
          resolve(dataURL);
        } catch (ex) {
          resolve("");
        }
      });
      imgElt.setAttribute("crossOrigin", "Anonymous");
      imgElt.setAttribute("src", imgUrl);
    });
  }
}
