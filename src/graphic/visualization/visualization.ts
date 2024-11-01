import { Layer } from "../../entity/drawing";
import { Multishape } from "../../entity/multishape";

export interface Visualization {
    toSVG(layer: Layer): string[];
}