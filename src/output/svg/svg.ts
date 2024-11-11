import * as fs from "fs";
import { DebugVisualization } from "./debug";
import { Drawing } from "../../domain/drawing";
import { Output } from "../output";
import SvgConfig from './elements';
import { Program } from "../../domain/program";

export class SvgFile {
    toHtml(drawing: Drawing, program: Program): string {
        let html = `
        <!-- script src="./lib/svg-pan-zoom.min.js"></script -->
        <style>
        svg { 
            stroke: gray; 
            fill: none;
            stroke-width: 1;
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

        </style>
        `;
        html += new Output(drawing, SvgConfig, program).render();
        html += `
        <!-- script>
            window.onload = function() {
                // Expose to window namespase for testing purposes
                svgPanZoom('#drawing', {
                    zoomEnabled: true,
                    center: 1
                });
            };
        </script -->`;
        return html;
    }

    // save(drawing: Drawing, path: string) {
    //     const html = this.toHtml(drawing);
    //     fs.writeFile(path, html, (e) => { });
    // }
}
