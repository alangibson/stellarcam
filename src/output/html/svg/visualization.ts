import { Layer } from "../../../domain/layer";
import { Multishape } from "../../../domain/multishape";

export interface Visualization {
    toSVG(layer: Layer): string[];
}