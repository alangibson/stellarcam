import { Layer } from "../../../domain/layer";
import { Multishape } from "../../../domain/multishape";
import { Visualization } from "./visualization";

export class DrawingVisualization implements Visualization {

    toSVG(layer: Layer): string[] {
        const elements: string[] = [];

        for (const cut of layer.children) {
            const multishapes: Multishape[] = cut.children;
            for (let multishape of multishapes) {
                const stroke: string = "black";
                let svg_path = "";
                for (let shape of multishape.shapes) {
                    svg_path += shape.command;
                }
                elements.push(`<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(multishape)})'/>`);
            }
        }

        return elements;
    }

}