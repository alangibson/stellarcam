import * as fs from 'fs';
import { Multishape } from "../entity/multishape";
import { Area } from "../geometry/area";

export class SvgFile {

    render(multishapes: Multishape[]): string[] {
        const svg_paths: string[] = [];
        for (let multishape of multishapes) {
            let svg_path: string = "";
            for (let shape of multishape.shapes) {
                svg_path += shape.command;
            }
            svg_paths.push(svg_path);
        }
        return svg_paths;
    }

    save(area: Area, multishapes: Multishape[], path: string) {
        const svg_paths: string[] = this.render(multishapes);

        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        // const dataURL = stage.toDataURL({ pixelRatio: 10 });
        // <img width="${area.width}" height="${area.height}" src="${dataURL}"/>
        let html = `
        <html>
        <body>
        <svg width="${area.width}" height="${area.height}">
        `;
        for (let i = 0; i < svg_paths.length; i++) {
            const svg_path = svg_paths[i];
            const stroke: string = getRandomColor();
            html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" />`;
        }
        html += `</svg>
        
        </body>
        </html>
        `
        fs.writeFile(path, html, (e) => { });

    }

}