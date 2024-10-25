import * as fs from 'fs';
import { Multishape } from "../entity/multishape";
import { Area } from "../geometry/area";

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export class SvgFile {

    // render(multishapes: Multishape[]): string[] {
    //     const svg_paths: string[] = [];
    //     for (let multishape of multishapes) {
    //         let svg_path: string = "";
    //         for (let shape of multishape.shapes) {
    //             svg_path += shape.command;
    //         }
    //         svg_paths.push(svg_path);
    //     }
    //     return svg_paths;
    // }

    // save2(area: Area, multishapes: Multishape[], path: string) {
    //     const svg_paths: string[] = this.render(multishapes);

    //     // The value of the viewBox attribute is a list of four 
    //     // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
    //     // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
    //     const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

    //     let html = `
    //     <html>
    //     <body>
    //     <svg width="${area.width+2}" height="${area.height+2}">
    //     `;
    //     for (let i = 0; i < svg_paths.length; i++) {
    //         const svg_path = svg_paths[i];
    //         const stroke: string = getRandomColor();
    //         html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver="console.log(event)"/>`;
    //     }
    //     html += `</svg>
        
    //     </body>
    //     </html>
    //     `
    //     fs.writeFile(path, html, (e) => { });
    // }

    save(area: Area, multishapes: Multishape[], path: string) {
        // const svg_paths: string[] = this.render(multishapes);

        // The value of the viewBox attribute is a list of four 
        // numbers separated by whitespace and/or a comma: min-x, min-y, width, and height.
        // ' viewBox="' + (-1 + bbox.minX) + ' ' + (-1) + ' ' +  (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
        const view_box: string = `${(-1 + area.min.x)} -1 ${(area.width + 2)} ${(area.height + 2)}`;

        let html = `
        <html>
        <body>
        <svg width="${area.width+2}" height="${area.height+2}">
        `;
        for (let multishape of multishapes) {
            const stroke: string = getRandomColor();
            let svg_path = "";
            for (let shape of multishape.shapes) {
                svg_path += shape.command;
            }
            html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(multishape)})'/>`;
        }

        // for (let i = 0; i < svg_paths.length; i++) {
        //     const svg_path = svg_paths[i];
        //     const stroke: string = getRandomColor();
        //     html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver="console.log(event)"/>`;
        // }
        html += `</svg>
        
        </body>
        </html>
        `
        fs.writeFile(path, html, (e) => { });
    }

}