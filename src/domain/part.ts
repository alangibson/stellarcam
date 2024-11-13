import { Parent } from "../entity/parent";
import { Cut } from "./cut";

export interface IPart {
  shell: Cut;
  holes: Cut[];
}

export class Part extends Parent<Cut> implements IPart {
  shell: Cut;
  holes: Cut[];

  constructor({shell, holes = []}: IPart) {
    super([shell, ...holes]);
    this.shell = shell;
    this.holes = holes;
  }

}
