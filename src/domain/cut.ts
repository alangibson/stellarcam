import { Parent } from "../entity/parent";
import { PointProperties } from "../geometry/point/point";
import { Chain } from "./chain";
import { Lead } from "./lead";
import { Rapid } from "./rapid";

export class Cut extends Parent<Chain> {

  children: Chain[];
  rapidTo: Rapid;
  leadIn: Lead;
  chain: Chain;
  leadOut: Lead;

  constructor(chain: Chain) {
    super([chain]);
    this.chain = chain;
  }

  get startPoint(): PointProperties {
    // FIXME assumes only one chain, but is array
    return this.children[0].startPoint;
  }

  get endPoint(): PointProperties {
    // FIXME assumes only one chain, but is array
    return this.children[0].endPoint;
  }

}
