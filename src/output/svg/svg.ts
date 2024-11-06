import * as fs from "fs";
import { DebugVisualization } from "./debug";
import { Drawing } from "../../domain/drawing";

export class SvgFile {
    toHtml(drawing: Drawing): string {
        // The value of the viewBox attribute is a list of four
        // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
        // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
        // const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

        // width="${area.width+2}" height="${area.height+2}"
        let html = `
        <script src="./lib/svg-pan-zoom.min.js"></script>
        <svg id="drawing" class="drawing" width="100%" height="100vh" preserveAspectRatio="none">
        `;

        // TODO draw box around drawing
        // const drawingBoundingBox: Rectangle = drawing.boundary;

        for (const layer of drawing.children) {
            html += `<g class="layer" layer-name="${layer.name}">`;

            // TODO Loop over layers in drawing.children then create visualization per layer
            // const drawing_elements = new DrawingVisualization().to_svg(multishapes);
            // const debug_elements = new DebugVisualization().to_svg(multishapes);
            // const drawing_elements = new DrawingVisualization().to_svg(layer);
            const debug_elements = new DebugVisualization().toSVG(layer);

            // const svgLines: string[] = new Output(drawing).apply(SvgConfig);
            // const html: string = svgLines.reduce((prev: string, curr: string) => prev += curr);

            // for (const cut of layer.children) {
            // }

            // Multishape visualization
            // for (let element of drawing_elements) {
            //     html += element;
            // }
            // Debug visualization
            for (let element of debug_elements) {
                html += element;
            }

            html += `</g>`;
        }

        html += `
        </svg>
        <script>
            window.onload = function() {
                // Expose to window namespase for testing purposes
                svgPanZoom('#drawing', {
                    zoomEnabled: true,
                    center: 1
                });
            };
        </script>
        `;
        return html;
    }

    save(drawing: Drawing, path: string) {
        const html = this.toHtml(drawing);
        fs.writeFile(path, html, (e) => { });
    }
}
