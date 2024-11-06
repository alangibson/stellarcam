import { Rectangle } from "../geometry/rectangle/rectangle";
import { Entity } from "./entity";

export class Parent implements Entity {

    children: Entity[];

    constructor(children: Entity[] = []) {
        this.children = children;
    }

    get boundary(): Rectangle {
        const boundary = new Rectangle({ startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
        this.children.forEach((entity) => boundary.join(entity.boundary));
        return boundary;
    }

}
