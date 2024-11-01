import { Shape } from "../../geometry/shape";

export class DXFLayer {
    
    name: string;
    shapes: Shape[];

    constructor(name: string, shapes: Shape[] = []) {
        this.name = name;
        this.shapes = shapes;
    }
}
