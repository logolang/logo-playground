import { ProgramModel } from "app/services/program/program.model";
import { ProgramStorageType } from "app/services/program/program-management.service";

export class ProgramsHtmlSerializerService {
  public parse(serialized: string): ProgramModel[] {
    const result: ProgramModel[] = [];
    const bodyStartIndex = serialized.indexOf("<body>");
    const bodyEndIndex = serialized.indexOf("</html>");
    const bodyXml = serialized.substring(bodyStartIndex, bodyEndIndex - 1);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(bodyXml, "application/xml");
    console.log(xmlDoc);

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

  public serialize(programs: ProgramModel[]) {
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
            }

            h1 {
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
        <div class="container">
            <h1 class="title">Logo personal library</h1>
            <table>
                <tbody>
                    ${programs.map(p => this.serializeProgram(p)).join("")}
                </tbody>
            <table>
        </div>
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
    <img alt="Program screenshot" src="${program.screenshot || "http://via.placeholder.com/350x150?text=No+image"}"
    />
  </td>
  <td>
    <pre>${this.encodeHtml(program.code)}</pre>
  </td>
</tr>
  `;
  }

  private encodeHtml(str: string): string {
    const buf: string[] = [];
    for (let i = str.length - 1; i >= 0; i--) {
      buf.unshift(["&#", str[i].charCodeAt(0), ";"].join(""));
    }
    return buf.join("");
  }
}
