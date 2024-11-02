import { Area } from "../geometry/area";
import { Layer } from "./layer";

/** A DXF/SVG drawing. */
export class Drawing {
  children: Layer[];
  area: Area;

  constructor(children: Layer[], area: Area) {
    this.children = children;
    this.area = area;
  }
}
