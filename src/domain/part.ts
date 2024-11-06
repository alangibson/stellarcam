import { Cut } from "./cut";

export class Part {
  children: Cut[];

  constructor(children: Cut[]) {
    this.children = children;
  }

}
