import * as fs from 'fs';
import { Multishape } from "../entity/multishape";
import { Area } from "../geometry/area";
import { DebugVisualization } from '../graphic/visualization';

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export class SvgFile {

    save(area: Area, multishapes: Multishape[], path: string) {
        // const svg_paths: string[] = this.render(multishapes);

        // The value of the viewBox attribute is a list of four 
        // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
        // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
        const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

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
        for (let multishape of multishapes) {
            const stroke: string = getRandomColor();
            let svg_path = "";
            for (let shape of multishape.shapes) {
                svg_path += shape.command;
            }
            html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(multishape)})'/>`;
        }
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