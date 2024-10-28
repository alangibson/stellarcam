import { DirectionEnum } from "../geometry/geometry.enum";
import { Point } from "../geometry/point";
import { Shape } from "../geometry/shape";
import { sortShapesInDirection } from "./multishape.function";

export class Multishape {

    shapes: Shape[];
    // Direction starts out as undefined since shapes can be oriented
    // in either direction at the time they're added.
    private _direction: DirectionEnum;
    
    constructor(shapes: Shape[] = []) {
        this.shapes = shapes;
    }
    
    get direction(): DirectionEnum {
        return this._direction;
    }

    set direction(direction: DirectionEnum) {
        for (let shape of this.shapes) {
            shape.direction = direction;
        }
        this._direction = direction;
    }

    get start_point(): Point {
        return this.shapes[0].start_point;
    }

    get end_point(): Point {
        return this.shapes[this.shapes.length - 1].end_point;
    }

    /** 
     * Sort shapes, using start and end points, in correct order according 
     * to this._direction 
    */
    private sort() {
        // TODO
        // Example usage:
        // const shapes = [
        //     { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
        //     { start: { x: 1, y: 0 }, end: { x: 1, y: 1 } },
        //     { start: { x: 1, y: 1 }, end: { x: 0, y: 1 } },
        //     { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
        // ];
        // const sortedShapesClockwise = sortShapes(shapes, "clockwise");
        // console.log("Clockwise:", sortedShapesClockwise);
        // const sortedShapesCounterClockwise = sortShapes(shapes, "counterclockwise");
        // console.log("Counterclockwise:", sortedShapesCounterClockwise);
        this.shapes = sortShapesInDirection(this.shapes, this._direction);
    }

    /** Returns true if, starting with first shape, each subsequent shape is connected end-to-start point */
    isConnected(): boolean {
        let last_shape: Shape;
        for (let shape of this.shapes) {
            if (last_shape) {
                if (last_shape.end_point.isEqual(shape.start_point)) {
                    // good result
                } else {
                    // bad result
                    return false;
                }
            }
            last_shape = shape;
        }
        return true;
    }

    add(shape: Shape) {
        this.shapes.push(shape);
    }

}
