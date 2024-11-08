import { Parent } from "../entity/parent";
import { PointProperties } from "../geometry/point/point";
import { Chain } from "./chain";
import { Rapid } from "./rapid";

export class Cut extends Parent {
  children: Chain[];
  rapidTo: Rapid;

  get startPoint(): PointProperties {
    // FIXME assumes only one chain, but is array
    return this.children[0].startPoint;
  }

  get endPoint(): PointProperties {
    // FIXME assumes only one chain, but is array
    return this.children[0].endPoint;
  }

  constructor(chain: Chain) {
    super([chain]);
  }

}
