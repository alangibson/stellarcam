import { Cut, CutProperties } from "./cut";

export interface PartProperties {

}

export interface IPart extends PartProperties {

  shell: Cut;
  holes: Cut[];

}

export class Part implements IPart {

  // Children
  shell: Cut;
  holes: Cut[];

  constructor({shell, holes} : IPart) {
    this.shell = shell;
    this.holes = holes;
  }

  get children(): Cut[] {
    return [...this.holes, this.shell];
  }

}
