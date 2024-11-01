import { Layer } from "../../entity/layer";
import { Multishape } from "../../entity/multishape";

export interface Visualization {
    toSVG(layer: Layer): string[];
}