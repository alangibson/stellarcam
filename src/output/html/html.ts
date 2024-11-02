import * as fs from "fs";
import * as Mustache from "mustache";
import { Drawing } from "../../domain/drawing";
import { SvgFile } from "./svg/svg";

export class HtmlFile {
  save(drawing: Drawing, path: string) {
    const left = Mustache.render(
      fs.readFileSync("./src/output/html/left.mustache", "utf-8"),
      { drawing },
    );
    const svg = new SvgFile().toHtml(drawing);
    const middle = Mustache.render(
      fs.readFileSync("./src/output/html/middle.mustache", "utf-8"),
      { drawing, svg },
    );
    const html = Mustache.render(
      fs.readFileSync("./src/output/html/html.mustache", "utf-8"),
      {
        left,
        middle,
        svg,
      },
    );
    fs.writeFileSync(path, html);
  }
}
