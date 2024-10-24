import { Shape } from "./shape";

export class Multishape {
    shapes: Shape[];

    constructor(shapes: Shape[] =[]) {
        this.shapes = shapes;
    }
}