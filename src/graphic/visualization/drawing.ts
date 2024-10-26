import { Multishape } from "../../entity/multishape";
import { Visualization } from "./visualization";

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export class DrawingVisualization implements Visualization {
    
    to_svg(multishapes: Multishape[]): string[] {
        const elements: string[] = [];
        for (let multishape of multishapes) {
            const stroke: string = getRandomColor();
            let svg_path = "";
            for (let shape of multishape.shapes) {
                svg_path += shape.command;
            }
            elements.push(`<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(multishape)})'/>`);
        }
        return elements;
    }
    
}