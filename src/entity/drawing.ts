import { Area } from "../geometry/area";
import { Multishape } from "./multishape";

/** A DXF/SVG drawing. */
export class Drawing {

    children: Layer[];
    area: Area;

    constructor(children: Layer[], area: Area) {
        this.children = children;
        this.area = area;
    }

}

/** A DXF layer */
export class Layer {

    name: string;
    children: Cut[];

    constructor(name: string, children: Cut[]) {
        this.name = name;
        this.children = children;
    }

}

// export class Part {

//     children: Cut[];

// }

export class Cut {

    children: Multishape[];

    constructor(multishape: Multishape) {
        this.children = [];
        this.children.push(multishape);
    }

}
