import { DXFLayer } from "./dxf-layer";

export class DXFDrawing {

    layers: {[name:string]: DXFLayer};

    constructor(layers: {[key:string]: DXFLayer} ) {
        this.layers = layers;
    }
}