import Konva from "konva";
import { Geometry } from "../geometry/geometry";

export interface Graphic {
    geometry: Geometry;
    render(layer: Konva.Layer): Konva.Shape;
}