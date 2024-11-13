import { Parent } from "../entity/parent";
import { Area } from "../geometry/area";
import { Rectangle } from "../geometry/rectangle/rectangle";
import { Layer } from "./layer";

/** A DXF/SVG drawing. */
export class Drawing extends Parent<Layer> {
  children: Layer[];
  area: Area;

  get width(): number {
    return this.boundary.width;
  }

  get height(): number {
    return this.boundary.height;
  }

  get units(): string {
    // TODO don't hard code mm
    return 'mm';
  }

  constructor(children: Layer[], area: Area) {
    super(children);
    this.area = area;
  }

}
