
/** A DXF layer */

import { Part } from "./part";

export class Layer {
  name: string;
  children: Part[];

  constructor(name: string, children: Part[]) {
    this.name = name;
    this.children = children;
  }
}
