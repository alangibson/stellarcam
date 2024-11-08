import { Layer } from "../../domain/layer";
import { Chain } from "../../domain/chain";
import { Visualization } from "./visualization";

export class DrawingVisualization implements Visualization {
  toSVG(layer: Layer): string[] {
    const elements: string[] = [];

    for (const part of layer.children) {
      for (const cut of part.children) {
        const chains: Chain[] = cut.children;
        for (let chain of chains) {
          const stroke: string = "black";
          let svg_path = "";
          for (let shape of chain.children) {
            svg_path += shape.command;
          }
          elements.push(
            `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" onMouseOver='console.log(${JSON.stringify(chain)})'/>`,
          );
        }
      }
    }

    return elements;
  }
}
