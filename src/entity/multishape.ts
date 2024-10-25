import { Geometry } from "../geometry/geometry";


export class Multishape {
    shapes: Geometry[];

    constructor(shapes: Geometry[] =[]) {
        this.shapes = shapes;
    }
}