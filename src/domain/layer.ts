
/** A DXF layer */

import { Parent } from "../entity/parent";
import { Part } from "./part";

export class Layer extends Parent {
  name: string;
  children: Part[];

  constructor(name: string, children: Part[]) {
    super(children)
    this.name = name;
  }
}
