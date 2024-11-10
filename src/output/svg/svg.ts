import * as fs from "fs";
import { DebugVisualization } from "./debug";
import { Drawing } from "../../domain/drawing";
import { Output } from "../output";
import SvgConfig from './elements';
import { Program } from "../../domain/program";

export class SvgFile {
    toHtml(drawing: Drawing, program: Program): string {
        // The value of the viewBox attribute is a list of four
        // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
        // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
        // const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

        // width="${area.width+2}" height="${area.height+2}"
        let html = `
        <script src="./lib/svg-pan-zoom.min.js"></script>
        <style>
        svg { 
            stroke: gray; 
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        
        .point { stroke-width: 1; }
        .start.point { stroke: green; }
        .end.point { stroke: red; }
        .middle.point { stroke: blue; }
        .center.point { stroke: yellow; }
        .control.point { stroke: blue; }

        .radius { stroke: yellow; }

        .line {}
        .control.line { stroke: none;}

        .rapid { 
            stroke: blue; 
            stroke-dasharray: 1; 
            stroke-linecap: butt;
            stroke-linejoin: miter;
            stroke-opacity: 0.5;
        }

        .chain { }

        /** TODO debug elements
        .debug { fill:none; stroke: gray; opacity: 1; stroke-width: 0.2; }
        .debug.chain { stroke-width: 1; opacity: 1; }
        .debug.shape { stroke-width: 0.5; opacity: 1; }
        .debug.middle { stroke-dasharray: 0.5; }
        .debug.start { stroke: green; opacity: 1;}
        .debug.middle { stroke: blue; }
        .debug.end { stroke: red; stroke-width: 0.5; opacity: 1; }
        */
        </style>
        `;
        html += new Output(drawing, SvgConfig, program).render();
        html += `
        <script>
            window.onload = function() {
                // Expose to window namespase for testing purposes
                svgPanZoom('#drawing', {
                    zoomEnabled: true,
                    center: 1
                });
            };
        </script>`;
        return html;
    }

    // save(drawing: Drawing, path: string) {
    //     const html = this.toHtml(drawing);
    //     fs.writeFile(path, html, (e) => { });
    // }
}
