import { Rectangle } from "../geometry/rectangle/rectangle";
import { Entity } from "./entity";

export class Parent<C extends Entity> implements Entity {

    children: C[];

    constructor(children: C[] = []) {
        this.children = children;
    }

    get boundary(): Rectangle {
        const boundary = new Rectangle({ startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
        this.children.forEach((entity) => boundary.join(entity.boundary));
        return boundary;
    }

}
