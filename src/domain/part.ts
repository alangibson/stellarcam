import { Parent } from "../entity/parent";
import { Cut } from "./cut";

export class Part extends Parent {
  children: Cut[];

  constructor(children: Cut[]) {
    super(children);
  }

}
