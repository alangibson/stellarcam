import { Shape } from "../geometry/shape";

export class InputLayer {
  name: string;
  shapes: Shape[];

  constructor(name: string, shapes: Shape[] = []) {
    this.name = name;
    this.shapes = shapes;
  }
}
