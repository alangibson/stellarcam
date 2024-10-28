import { Multishape } from "../../entity/multishape";
import { Visualization } from "./visualization";


export class DrawingVisualization implements Visualization {
    
    to_svg(multishapes: Multishape[]): string[] {
        const elements: string[] = [];
        for (let multishape of multishapes) {
            const stroke: string = "black";
            let svg_path = "";
            for (let shape of multishape.shapes) {
                svg_path += shape.command;
            }
            elements.push(`<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(multishape)})'/>`);
        }
        return elements;
    }
    
}