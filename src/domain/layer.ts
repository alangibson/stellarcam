
/** A DXF layer */

import { Parent } from "../entity/parent";
import { Chain } from "../geometry/chain/chain";

export class Layer extends Parent<Chain> {

  // Properties
  name: string;
  // Children
  children: Chain[];

  constructor(name: string, children: Chain[]) {
    super(children)
    this.name = name;
  }
}
