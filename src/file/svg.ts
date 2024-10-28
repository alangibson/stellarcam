import * as fs from 'fs';
import { Multishape } from "../entity/multishape";
import { Area } from "../geometry/area";
import { DrawingVisualization } from '../graphic/visualization/drawing';
import { DebugVisualization } from '../graphic/visualization/debug';

export class SvgFile {

    save(area: Area, multishapes: Multishape[], path: string) {
        // const svg_paths: string[] = this.render(multishapes);

        // The value of the viewBox attribute is a list of four 
        // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
        // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
        // const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

        const drawing_visualization = new DrawingVisualization()
        const drawing_elements = drawing_visualization.to_svg(multishapes);

        const debug_visualization = new DebugVisualization();
        const debug_elements = debug_visualization.to_svg(multishapes);

        let html = `
        <html>
        <head>
            <script src="./lib/svg-pan-zoom.min.js"></script>
        </head>
        <body>
        <svg id="drawing" width="${area.width+2}" height="${area.height+2}">
        `;
        // Multishape visualization
        // for (let element of drawing_elements) {
        //     html += element;
        // }
        // Debug visualization
        for (let element of debug_elements) {
            html += element;
        }
        html += `
        </svg>
        <script>
            window.onload = function() {
                // Expose to window namespase for testing purposes
                svgPanZoom('#drawing', {
                    zoomEnabled: true,
                    fit: true,
                    center: true,
                });
            };
        </script>
        </body>
        </html>
        `
        fs.writeFile(path, html, (e) => { });
    }

}