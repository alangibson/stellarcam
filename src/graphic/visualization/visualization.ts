import { Multishape } from "../../entity/multishape";

export interface Visualization {
    to_svg(multishapes: Multishape[]): string[];
}