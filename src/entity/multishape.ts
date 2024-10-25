import { DirectionEnum } from "../geometry/geometry.enum";
import { Shape } from "../geometry/shape";

export class Multishape {

    direction: DirectionEnum = DirectionEnum.CW;
    shapes: Shape[];

    constructor(shapes: Shape[] = []) {
        this.shapes = shapes;
    }

    append(shape: Shape) {
        // If shape.direction != this.direction, then change direction of shape
        shape.direction = this.direction;
        this.shapes.push(shape);
    }
}
