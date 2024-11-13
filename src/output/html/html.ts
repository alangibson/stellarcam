import * as fs from "fs";
import * as Mustache from "mustache";
import { Drawing } from "../../domain/drawing";
import { SvgFile } from "../svg/svg";
import { Program } from "../../domain/program";

export class HtmlFile {
  save(drawing: Drawing, path: string, program: Program) {

    // Left
    const left = Mustache.render(
      fs.readFileSync("./src/output/html/left.mustache", "utf-8"),
      { drawing, program },
    );

    // Middle
    const svg = new SvgFile().toHtml(drawing, program);
    const middle = Mustache.render(
      fs.readFileSync("./src/output/html/middle.mustache", "utf-8"),
      { drawing, svg },
    );

    // HTML file
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
