import { Parent } from "../entity/parent";
import { Area } from "../geometry/area";
import { Layer } from "./layer";

/** A DXF/SVG drawing. */
export class Drawing extends Parent {
  children: Layer[];
  area: Area;

  constructor(children: Layer[], area: Area) {
    super(children);
    this.area = area;
  }

}
