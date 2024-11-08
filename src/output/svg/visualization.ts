import { Layer } from "../../domain/layer";
import { Chain } from "../../domain/chain";

export interface Visualization {
  toSVG(layer: Layer): string[];
}
