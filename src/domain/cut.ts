import { Multishape } from "./multishape";

export class Cut {
  children: Multishape[];

  constructor(multishape: Multishape) {
    this.children = [];
    this.children.push(multishape);
  }
}
