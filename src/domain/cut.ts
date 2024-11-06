import { Parent } from "../entity/parent";
import { PointProperties } from "../geometry/point/point";
import { Multishape } from "./multishape";
import { Rapid } from "./rapid";

export class Cut extends Parent {
  children: Multishape[];
  rapidTo: Rapid;

  get startPoint(): PointProperties {
    // FIXME assumes only one multishape, but is array
    return this.children[0].startPoint;
  }

  get endPoint(): PointProperties {
    // FIXME assumes only one multishape, but is array
    return this.children[0].endPoint;
  }

  constructor(multishape: Multishape) {
    super([multishape]);
  }

}
