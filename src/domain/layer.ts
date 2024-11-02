import { Cut } from "./cut";

/** A DXF layer */

export class Layer {
  name: string;
  children: Cut[];

  constructor(name: string, children: Cut[]) {
    this.name = name;
    this.children = children;
  }
}
