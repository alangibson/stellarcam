
/** A DXF layer */

import { Parent } from "../entity/parent";
import { Chain } from "./chain";

export class Layer extends Parent<Chain> {
  name: string;
  children: Chain[];

  constructor(name: string, children: Chain[]) {
    super(children)
    this.name = name;
  }
}
